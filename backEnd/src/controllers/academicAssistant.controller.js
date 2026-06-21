const { Op } = require("sequelize");
const {
  estudiante,
  situacion_academica,
  plan_estudio,
  materia,
  estado_materia,
  correlatividad,
  actividad_credito,
  oferta_academica,
  final,
} = require("../db/models");
const { obtenerMateriasConCorrelativas } = require("../services/simuladorCursada.service");

const APROBADA = ["aprobada", "aprobado", "promocionada", "promotionada"];
const REGULAR = ["regular", "regularizada", "regularizado"];
const CURSANDO = ["cursando"];

const normalizar = (estado) => (estado || "").trim().toLowerCase();
const esAprobada = (e) => APROBADA.includes(normalizar(e));
const esRegular = (e) => REGULAR.includes(normalizar(e));
const esCursando = (e) => CURSANDO.includes(normalizar(e));

const emptyPayload = {
  progress: { percentage: 0, label: "Avance de carrera" },
  stats: {
    approved: 0,
    regularized: 0,
    pending: 0,
    creditsObtained: 0,
    creditsMissing: 0,
    unahurSubjects: 0,
  },
  subjects: [],
  finals: [],
  years: [],
  studentStatus: { approvedIds: [], inProgressIds: [] },
};

const getSituacionActiva = (estudianteId) =>
  situacion_academica.findOne({
    where: { estudiante_id: estudianteId },
    order: [
      ["fecha_inicio", "DESC"],
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
  });

const buildFinals = async (situacionId) => {
  const estados = await estado_materia.findAll({
    where: { situacion_id: situacionId },
    attributes: ["id", "materia_id", "estado", "fecha"],
    raw: true,
  });

  const estadosRegulares = estados.filter((e) => esRegular(e.estado));
  if (estadosRegulares.length === 0) return [];

  const regularEstadoIds = estadosRegulares.map((e) => e.id);

  const finalRecords = await final.findAll({
    where: { estado_materia_id: { [Op.in]: regularEstadoIds } },
    attributes: ["estado_materia_id"],
    raw: true,
  });

  const attemptCount = new Map();
  for (const f of finalRecords) {
    attemptCount.set(f.estado_materia_id, (attemptCount.get(f.estado_materia_id) || 0) + 1);
  }

  const materiaIds = estadosRegulares.map((e) => e.materia_id);
  const materiasMap = {};
  if (materiaIds.length > 0) {
    const materias = await materia.findAll({
      where: { id: { [Op.in]: materiaIds } },
      attributes: ["id", "nombre"],
      raw: true,
    });
    for (const m of materias) {
      materiasMap[m.id] = m.nombre;
    }
  }

  const ahora = new Date();

  return estadosRegulares.map((e) => {
    const fechaRegular = e.fecha ? new Date(e.fecha) : new Date();
    const expiracion = new Date(fechaRegular);
    expiracion.setFullYear(expiracion.getFullYear() + 2);

    const diffMs = expiracion - ahora;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let status = "valid";
    if (diffDays <= 0) status = "expired";
    else if (diffDays <= 60) status = "expiring";

    return {
      id: e.id,
      name: materiasMap[e.materia_id] || `Materia #${e.materia_id}`,
      attempts: attemptCount.get(e.id) || 0,
      expires: expiracion.toLocaleDateString("es-AR"),
      status,
    };
  });
};

const buildYearsAnalysis = (materias, estadoPorMateria) => {
  const yearsMap = new Map();

  for (const m of materias) {
    const anio = m.anio_cursada || 1;
    if (!yearsMap.has(anio)) {
      yearsMap.set(anio, { year: anio, total: 0, approved: 0, regularized: 0, missing: 0 });
    }
    const entry = yearsMap.get(anio);
    entry.total += 1;

    const estado = estadoPorMateria.get(m.id);
    if (esAprobada(estado)) {
      entry.approved += 1;
    } else if (esRegular(estado)) {
      entry.regularized += 1;
    } else {
      entry.missing += 1;
    }
  }

  return Array.from(yearsMap.values())
    .sort((a, b) => a.year - b.year)
    .map((y) => ({
      ...y,
      percentage: y.total > 0 ? Math.round((y.approved / y.total) * 100) : 0,
    }));
};

const getAcademicAssistant = async (req, res, next) => {
  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });

  if (!estudianteData) {
    return res.status(200).json({ ok: true, data: emptyPayload });
  }

  const situacion = await getSituacionActiva(estudianteData.id);
  if (!situacion) {
    return res.status(200).json({ ok: true, data: emptyPayload });
  }

  const plan = await plan_estudio.findByPk(situacion.plan_id, {
    include: [
      {
        model: materia,
        as: "materias",
        include: [
          {
            model: correlatividad,
            as: "correlatividades",
            attributes: ["materia_id", "materia_requisito_id", "tipo"],
          },
          {
            model: oferta_academica,
            attributes: ["anio"],
          },
        ],
      },
    ],
  });

  if (!plan) {
    return res.status(200).json({ ok: true, data: emptyPayload });
  }

  const materias = plan.materias || [];

  const estados = await estado_materia.findAll({
    where: { situacion_id: situacion.id },
    attributes: ["id", "materia_id", "estado", "fecha"],
    raw: true,
  });

  const actividades = await actividad_credito.findAll({
    where: { situacion_id: situacion.id },
    attributes: ["creditos"],
    raw: true,
  });

  const estadoPorMateria = new Map();
  for (const e of estados) {
    estadoPorMateria.set(e.materia_id, e.estado);
  }

  const aprobadasIds = new Set(
    estados.filter((e) => esAprobada(e.estado)).map((e) => e.materia_id)
  );

  const inProgressIds = estados
    .filter((e) => esCursando(e.estado) || esRegular(e.estado))
    .map((e) => e.materia_id);

  let approved = 0;
  let regularized = 0;
  let cursando = 0;
  let creditsFromMaterias = 0;
  let unahurSubjects = 0;

  for (const m of materias) {
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

  const totalMaterias = materias.length;
  const pending = Math.max(0, totalMaterias - approved - regularized - cursando);

  const creditsFromActividades = actividades.reduce(
    (sum, a) => sum + (a.creditos || 0), 0
  );
  const creditsObtained = creditsFromMaterias + creditsFromActividades;
  const creditsRequeridos = plan.creditos_requeridos || 0;
  const creditsMissing = Math.max(0, creditsRequeridos - creditsObtained);

  const percentage =
    totalMaterias > 0 ? Math.round((approved / totalMaterias) * 100) : 0;

  const anioActual = new Date().getFullYear();
  const subjects = [];

  for (const m of materias) {
    const estado = estadoPorMateria.get(m.id);
    if (esAprobada(estado) || esRegular(estado) || esCursando(estado)) {
      continue;
    }

    const correlativas = m.correlatividades || [];
    const cumpleTodas = correlativas.every((c) =>
      aprobadasIds.has(c.materia_requisito_id)
    );

    if (!cumpleTodas) continue;

    const ofertas = m.oferta_academicas || [];
    const availableThisTerm = ofertas.some((o) => o.anio === anioActual);

    subjects.push({
      id: m.id,
      name: m.nombre,
      year: `${m.anio_cursada}°`,
      type: m.modalidad || "Cuatrimestral",
      correlatives: {
        status: "fulfilled",
        text: correlativas.length === 0 ? "Sin correlativas" : "Cumple",
      },
      status: "available",
      availableThisTerm,
    });
  }

  const [finalsData, yearsData] = await Promise.all([
    buildFinals(situacion.id),
    Promise.resolve(buildYearsAnalysis(materias, estadoPorMateria)),
  ]);

  return res.status(200).json({
    ok: true,
    data: {
      progress: { percentage, label: "Avance de carrera" },
      stats: {
        approved,
        regularized,
        pending,
        creditsObtained,
        creditsMissing,
        unahurSubjects,
      },
      subjects,
      finals: finalsData,
      years: yearsData,
      studentStatus: {
        approvedIds: Array.from(aprobadasIds),
        inProgressIds,
      },
    },
  });
};

const getPlanSubjects = async (req, res, next) => {
  try {
    const estudianteData = await estudiante.findOne({
      where: { usuario_id: req.user.sub },
    });

    if (!estudianteData) {
      return res.status(200).json({ ok: true, data: { subjects: [] } });
    }

    const situacion = await situacion_academica.findOne({
      where: { estudiante_id: estudianteData.id },
      order: [["fecha_inicio", "DESC"], ["createdAt", "DESC"], ["id", "DESC"]],
    });

    if (!situacion) {
      return res.status(200).json({ ok: true, data: { subjects: [] } });
    }

    const data = await obtenerMateriasConCorrelativas(situacion.plan_id);
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAcademicAssistant, getPlanSubjects };
