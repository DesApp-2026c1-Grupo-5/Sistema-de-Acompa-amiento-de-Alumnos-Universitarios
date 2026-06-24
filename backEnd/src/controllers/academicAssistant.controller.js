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
      return res.status(200).json({
        ok: true,
        data: {
          subjects: [],
          currentPlan: [],
        },
      });
    }

    const situacion = await getSituacionActiva(estudianteData.id);

    if (!situacion) {
      return res.status(200).json({
        ok: true,
        data: {
          subjects: [],
          currentPlan: [],
        },
      });
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
          ],
        },
      ],
    });

    if (!plan) {
      return res.status(200).json({
        ok: true,
        data: {
          subjects: [],
          currentPlan: [],
        },
      });
    }

    const estados = await estado_materia.findAll({
      where: { situacion_id: situacion.id },
      attributes: ["materia_id", "estado"],
      raw: true,
    });

    const estadoPorMateria = new Map(
      estados.map((estado) => [estado.materia_id, estado.estado])
    );

    const materias = plan.materias || [];

    const aprobadasIds = new Set(
      estados
        .filter((estado) => esAprobada(estado.estado))
        .map((estado) => estado.materia_id)
    );

    const regularizadasIds = new Set(
      estados
        .filter((estado) => esRegular(estado.estado))
        .map((estado) => estado.materia_id)
    );

    const cursandoIds = new Set(
      estados
        .filter((estado) => esCursando(estado.estado))
        .map((estado) => estado.materia_id)
    );

    const materiasHabilitantes = new Set([
      ...aprobadasIds,
      ...regularizadasIds,
    ]);

    const materiasPendientes = materias
      .filter((m) => {
        const estado = estadoPorMateria.get(m.id);

        return (
          !esAprobada(estado) &&
          !esRegular(estado) &&
          !esCursando(estado)
        );
      })
      .map((m) => {
        const correlativas = (m.correlatividades || []).map(
          (c) => c.materia_requisito_id
        );

        return {
          id: m.id,
          name: m.nombre,
          year: m.anio_cursada || 1,
          cuatrimestre:
            m.cuatrimestre ||
            m.cuatrimestre_cursada ||
            (m.anio_cursada % 2 === 0 ? 2 : 1),
          type: m.modalidad || "Cuatrimestral",
          hours: m.horas_semanales || m.carga_horaria || 6,
          credits: m.creditos_otorga || 0,
          correlatives: correlativas,
          status: "pendiente",
          approved: aprobadasIds.has(m.id),
          regularized: regularizadasIds.has(m.id),
          inProgress: cursandoIds.has(m.id),
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.cuatrimestre - b.cuatrimestre;
      });

    const pendientesIds = new Set(materiasPendientes.map((m) => m.id));

    const currentPlan = [];
    const materiasPlanificadas = new Set();
    const materiasDisponibles = [...materiasPendientes];

    let anioActual = 1;
    let cuatrimestreActual = 1;
    let seguridad = 0;

    while (materiasDisponibles.length > 0 && seguridad < 200) {
      seguridad += 1;

      const grupo = {
        year: anioActual,
        cuatrimestre: cuatrimestreActual,
        label: `Año ${anioActual} - Cuatrimestre ${cuatrimestreActual}`,
        subjects: [],
      };

      let horasGrupo = 0;
      let huboMateriaAgregada = false;

      for (let i = 0; i < materiasDisponibles.length; i += 1) {
        const materiaActual = materiasDisponibles[i];

        const cumpleCorrelativas = materiaActual.correlatives.every(
          (correlativaId) =>
            materiasHabilitantes.has(correlativaId) ||
            materiasPlanificadas.has(correlativaId) ||
            !pendientesIds.has(correlativaId)
        );

        if (!cumpleCorrelativas) continue;

        if (horasGrupo + materiaActual.hours > 20) continue;

        grupo.subjects.push({
          id: materiaActual.id,
          name: materiaActual.name,
          hours: materiaActual.hours,
          correlatives: materiaActual.correlatives,
          extraHours: 0,
        });

        horasGrupo += materiaActual.hours;
        materiasPlanificadas.add(materiaActual.id);
        materiasDisponibles.splice(i, 1);
        i -= 1;
        huboMateriaAgregada = true;
      }

      if (grupo.subjects.length > 0) {
        currentPlan.push(grupo);
      }

      if (cuatrimestreActual === 1) {
        cuatrimestreActual = 2;
      } else {
        cuatrimestreActual = 1;
        anioActual += 1;
      }

      if (!huboMateriaAgregada && materiasDisponibles.length > 0) {
        const materiaForzada = materiasDisponibles.shift();

        currentPlan.push({
          year: anioActual,
          cuatrimestre: cuatrimestreActual,
          label: `Año ${anioActual} - Cuatrimestre ${cuatrimestreActual}`,
          subjects: [
            {
              id: materiaForzada.id,
              name: materiaForzada.name,
              hours: materiaForzada.hours,
              correlatives: materiaForzada.correlatives,
              extraHours: 0,
            },
          ],
        });

        materiasPlanificadas.add(materiaForzada.id);
      }
    }

    const todasMaterias = await materia.findAll({
      attributes: ["id", "nombre"],
      raw: true,
    });
    const materiasNombres = {};
    for (const m of todasMaterias) {
      materiasNombres[m.id] = m.nombre;
    }

    return res.status(200).json({
      ok: true,
      data: {
        subjects: materiasPendientes,
        currentPlan,
        materiasNombres,
        summary: {
          totalSubjects: materias.length,
          pendingSubjects: materiasPendientes.length,
          approvedSubjects: aprobadasIds.size,
          regularizedSubjects: regularizadasIds.size,
          inProgressSubjects: cursandoIds.size,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAcademicAssistant, getPlanSubjects };
