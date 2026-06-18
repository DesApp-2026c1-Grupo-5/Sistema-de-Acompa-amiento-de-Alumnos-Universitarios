const { Op } = require("sequelize");
const db = require("../db/models");
const { registrarAccionAcademica } = require("../services/publicacionAcademica.service");

const {
  estudiante,
  situacion_academica,
  plan_estudio,
  materia,
  estado_materia,
  final,
  actividad_credito,
  carrera,
  correlatividad,
} = db;

const APROBADA = ["aprobada", "aprobado", "promocionada", "promotionada"];
const REGULAR = ["regular", "regularizada", "regularizado"];
const CURSANDO = ["cursando"];

const normalizar = (e) => (e || "").trim().toLowerCase();
const esAprobada = (e) => APROBADA.includes(normalizar(e));
const esRegular = (e) => REGULAR.includes(normalizar(e));
const esCursando = (e) => CURSANDO.includes(normalizar(e));

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getEstudiante = async (usuarioId) =>
  estudiante.findOne({ where: { usuario_id: usuarioId } });

const getSituacionActiva = async (estudianteId) =>
  situacion_academica.findOne({
    where: { estudiante_id: estudianteId },
    order: [["fecha_inicio", "DESC"], ["createdAt", "DESC"], ["id", "DESC"]],
  });

const getEstudianteIdFromEstadoMateria = async (estadoMateriaId) => {
  const em = await estado_materia.findByPk(estadoMateriaId, { raw: true });
  if (!em) return null;
  const sit = await situacion_academica.findByPk(em.situacion_id, { raw: true });
  if (!sit) return null;
  return sit.estudiante_id;
};

const buildStats = async (situacionId, plan) => {
  const estados = await estado_materia.findAll({
    where: { situacion_id: situacionId },
    attributes: ["materia_id", "estado", "nota"],
    raw: true,
  });

  const actividades = await actividad_credito.findAll({
    where: { situacion_id: situacionId },
    attributes: ["creditos"],
    raw: true,
  });

  const planMaterias = await materia.findAll({
    where: { plan_id: plan.id },
    attributes: ["id", "creditos_otorga", "es_unahur"],
    raw: true,
  });

  const estadoPorMateria = new Map(estados.map((e) => [e.materia_id, e.estado]));

  let approved = 0;
  let regularized = 0;
  let cursando = 0;
  let creditsFromMaterias = 0;
  let unahurSubjects = 0;

  for (const m of planMaterias) {
    const estado = estadoPorMateria.get(m.id);
    if (esAprobada(estado)) {
      approved += 1;
      creditsFromMaterias += m.creditos_otorga || 0;
      if (m.es_unahur) unahurSubjects += 1;
    } else if (esRegular(estado)) {
      regularized += 1;
    } else if (esCursando(estado)) {
      cursando += 1;
    }
  }

  const creditsFromActividades = actividades.reduce(
    (sum, a) => sum + (a.creditos || 0), 0
  );
  const creditsObtained = creditsFromMaterias + creditsFromActividades;
  const totalMaterias = planMaterias.length;
  const pending = Math.max(0, totalMaterias - approved - regularized - cursando);
  const percentage = totalMaterias > 0 ? Math.round((approved / totalMaterias) * 100) : 0;

  return {
    progress_percentage: percentage,
    approved,
    regularized,
    in_progress: cursando,
    pending,
    credits_obtained: creditsObtained,
    credits_missing: Math.max(0, (plan.creditos_requeridos || 0) - creditsObtained),
    unahur_completed: unahurSubjects,
    unahur_required: plan.niveles_ingles_requeridos || 0,
  };
};

const buildSubjectDetail = async (situacionId, planId) => {
  const planMaterias = await materia.findAll({
    where: { plan_id: planId },
    include: [
      {
        model: correlatividad,
        as: "correlatividades",
        attributes: ["materia_id", "materia_requisito_id", "tipo"],
      },
    ],
    order: [["anio_cursada", "ASC"]],
  });

  const estados = await estado_materia.findAll({
    where: { situacion_id: situacionId },
    raw: true,
  });

  const estadoPorMateria = new Map();
  const estadoIdPorMateria = new Map();
  for (const e of estados) {
    estadoPorMateria.set(e.materia_id, e);
    estadoIdPorMateria.set(e.materia_id, e.id);
  }

  const estadoIds = estados.map((e) => e.id).filter(Boolean);
  let finalesPorEstado = new Map();
  if (estadoIds.length > 0) {
    const finales = await final.findAll({
      where: { estado_materia_id: { [Op.in]: estadoIds } },
      raw: true,
    });
    for (const f of finales) {
      const arr = finalesPorEstado.get(f.estado_materia_id) || [];
      arr.push(f);
      finalesPorEstado.set(f.estado_materia_id, arr);
    }
  }

  return planMaterias.map((m) => {
    const em = estadoPorMateria.get(m.id) || {};
    return {
      materia_id: m.id,
      name: m.nombre,
      code: m.codigo,
      year_in_career: m.anio_cursada,
      modalidad: m.modalidad,
      type: m.tipo,
      is_unahur: m.es_unahur,
      credits: m.creditos_otorga,
      correlatives: (m.correlatividades || []).map((c) => ({
        materia_requisito_id: c.materia_requisito_id,
        tipo: c.tipo,
      })),
      status: em.estado || "pendiente",
      grade: em.nota ?? null,
      academic_year: em.anio ?? null,
      academic_semester: em.cuatrimestre ?? null,
      fecha: em.fecha ?? null,
      finals: finalesPorEstado.get(em.id) || [],
    };
  });
};

const crearSituacion = async (req, res, next) => {
  const { plan_id } = req.body;

  const estudianteData = await getEstudiante(req.user.sub);
  if (!estudianteData) return next(buildError("Estudiante no encontrado", 404));

  const existente = await getSituacionActiva(estudianteData.id);
  if (existente) {
    return next(buildError("Ya tenés una situación académica activa", 409));
  }

  const plan = await plan_estudio.findByPk(plan_id, {
    include: [{ model: materia, as: "materias", attributes: ["id"] }],
  });
  if (!plan) return next(buildError("Plan de estudio no encontrado", 404));

  const situacion = await db.sequelize.transaction(async (t) => {
    const sit = await situacion_academica.create(
      { estudiante_id: estudianteData.id, plan_id, fecha_inicio: new Date() },
      { transaction: t }
    );

    const materiasPlan = plan.materias || [];
    if (materiasPlan.length > 0) {
      const pendientes = materiasPlan.map((m) => ({
        situacion_id: sit.id,
        materia_id: m.id,
        estado: "pendiente",
      }));
      await estado_materia.bulkCreate(pendientes, { transaction: t });
    }

    return sit;
  });

  return res.status(201).json({ ok: true, data: { id: situacion.id, plan_id } });
};

const obtenerSituacion = async (req, res, next) => {
  const estudianteData = await getEstudiante(req.user.sub);
  if (!estudianteData) return next(buildError("Estudiante no encontrado", 404));

  const situacion = await getSituacionActiva(estudianteData.id);
  if (!situacion) {
    return res.status(200).json({ ok: true, data: null });
  }

  const plan = await plan_estudio.findByPk(situacion.plan_id, {
    include: [{ model: carrera, attributes: ["nombre"] }],
  });
  if (!plan) return next(buildError("Plan de estudio no encontrado", 404));

  const [stats, subjects] = await Promise.all([
    buildStats(situacion.id, plan),
    buildSubjectDetail(situacion.id, plan.id),
  ]);

  const actividades = await actividad_credito.findAll({
    where: { situacion_id: situacion.id },
    raw: true,
  });

  const careerName = plan.carrera ? plan.carrera.nombre : null;

  return res.status(200).json({
    ok: true,
    data: {
      situation: {
        id: situacion.id,
        plan_id: plan.id,
        plan_name: plan.nombre,
        career_name: careerName,
        fecha_inicio: situacion.fecha_inicio,
        credits_required: plan.creditos_requeridos,
        unahur_conditions: plan.condiciones_unahur,
        english_levels_required: plan.niveles_ingles_requeridos,
      },
      stats,
      subjects,
      credit_activities: actividades.map((a) => ({
        id: a.id,
        description: a.descripcion,
        credits: a.creditos,
        date: a.fecha,
      })),
    },
  });
};

const actualizarMaterias = async (req, res, next) => {
  const estudianteData = await getEstudiante(req.user.sub);
  if (!estudianteData) return next(buildError("Estudiante no encontrado", 404));

  const situacion = await getSituacionActiva(estudianteData.id);
  if (!situacion) return next(buildError("Situación académica no encontrada", 404));

  const { materias } = req.body;
  const results = [];

  for (const item of materias) {
    try {
      if (item.estado === "pendiente") {
        const [em] = await estado_materia.findOrCreate({
          where: { situacion_id: situacion.id, materia_id: item.materia_id },
          defaults: { estado: "pendiente" },
        });
        await em.update({
          estado: "pendiente",
          anio: item.anio ?? em.anio,
          cuatrimestre: item.cuatrimestre ?? em.cuatrimestre,
          nota: item.nota ?? em.nota,
          fecha: item.fecha ? new Date(item.fecha) : em.fecha,
        });
        results.push({ materia_id: item.materia_id, success: true });
        continue;
      }

      if (item.estado === "cursando" || item.estado === "regular" || item.estado === "aprobada") {
        const accionMap = { cursando: "inscripcion", regular: "regularizacion", aprobada: "aprobacion" };
        const result = await registrarAccionAcademica(
          req.user.sub,
          item.materia_id,
          accionMap[item.estado],
          { anio: item.anio, cuatrimestre: item.cuatrimestre, nota: item.nota, fecha: item.fecha }
        );
        results.push({ materia_id: item.materia_id, success: true, data: result });
      }
    } catch (err) {
      results.push({ materia_id: item.materia_id, success: false, error: err.message });
    }
  }

  return res.status(200).json({ ok: true, data: results });
};

const crearFinal = async (req, res, next) => {
  const { estado_materia_id, fecha, nota, aprobado } = req.body;

  const estudianteData = await getEstudiante(req.user.sub);
  if (!estudianteData) return next(buildError("Estudiante no encontrado", 404));

  const estudianteId = await getEstudianteIdFromEstadoMateria(estado_materia_id);
  if (!estudianteId) return next(buildError("Estado de materia no encontrado", 404));
  if (estudianteId !== estudianteData.id) {
    return next(buildError("No tenés permisos sobre esta materia", 403));
  }

  const nuevo = await final.create({
    estado_materia_id,
    fecha: new Date(fecha),
    nota,
    aprobado,
  });

  return res.status(201).json({ ok: true, data: nuevo });
};

const eliminarFinal = async (req, res, next) => {
  const estudianteData = await getEstudiante(req.user.sub);
  if (!estudianteData) return next(buildError("Estudiante no encontrado", 404));

  const f = await final.findByPk(req.params.id, { raw: true });
  if (!f) return next(buildError("Final no encontrado", 404));

  const estudianteId = await getEstudianteIdFromEstadoMateria(f.estado_materia_id);
  if (!estudianteId || estudianteId !== estudianteData.id) {
    return next(buildError("No tenés permisos para eliminar este final", 403));
  }

  await final.destroy({ where: { id: req.params.id } });
  return res.status(200).json({ ok: true, data: { id: req.params.id } });
};

const crearActividad = async (req, res, next) => {
  const estudianteData = await getEstudiante(req.user.sub);
  if (!estudianteData) return next(buildError("Estudiante no encontrado", 404));

  const situacion = await getSituacionActiva(estudianteData.id);
  if (!situacion) return next(buildError("Situación académica no encontrada", 404));

  const { descripcion, creditos, fecha } = req.body;
  const actividad = await actividad_credito.create({
    situacion_id: situacion.id,
    descripcion,
    creditos,
    fecha: new Date(fecha),
  });

  return res.status(201).json({ ok: true, data: actividad });
};

const eliminarActividad = async (req, res, next) => {
  const estudianteData = await getEstudiante(req.user.sub);
  if (!estudianteData) return next(buildError("Estudiante no encontrado", 404));

  const actividad = await actividad_credito.findByPk(req.params.id, { raw: true });
  if (!actividad) return next(buildError("Actividad no encontrada", 404));

  const sit = await situacion_academica.findByPk(actividad.situacion_id, { raw: true });
  if (!sit || sit.estudiante_id !== estudianteData.id) {
    return next(buildError("No tenés permisos para eliminar esta actividad", 403));
  }

  await actividad_credito.destroy({ where: { id: req.params.id } });
  return res.status(200).json({ ok: true, data: { id: req.params.id } });
};

module.exports = {
  crearSituacion,
  obtenerSituacion,
  actualizarMaterias,
  crearFinal,
  eliminarFinal,
  crearActividad,
  eliminarActividad,
};
