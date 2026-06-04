const {
  estudiante,
  situacion_academica,
  plan_estudio,
  materia,
  estado_materia,
  correlatividad,
  actividad_credito,
  oferta_academica,
} = require("../db/models");

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
    attributes: ["materia_id", "estado"],
    raw: true,
  });

  const actividades = await actividad_credito.findAll({
    where: { situacion_id: situacion.id },
    attributes: ["creditos"],
    raw: true,
  });

  // Estado del alumno por materia
  const estadoPorMateria = new Map();
  for (const e of estados) {
    estadoPorMateria.set(e.materia_id, e.estado);
  }

  const aprobadasIds = new Set(
    estados.filter((e) => esAprobada(e.estado)).map((e) => e.materia_id)
  );

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
  const pending = Math.max(
    0,
    totalMaterias - approved - regularized - cursando
  );

  const creditsFromActividades = actividades.reduce(
    (sum, a) => sum + (a.creditos || 0),
    0
  );
  const creditsObtained = creditsFromMaterias + creditsFromActividades;
  const creditsRequeridos = plan.creditos_requeridos || 0;
  const creditsMissing = Math.max(0, creditsRequeridos - creditsObtained);

  const percentage =
    totalMaterias > 0 ? Math.round((approved / totalMaterias) * 100) : 0;

  // Materias disponibles para cursar
  const anioActual = new Date().getFullYear();
  const subjects = [];

  for (const m of materias) {
    const estado = estadoPorMateria.get(m.id);
    // Candidata: no aprobada, no regular, no cursando
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
    },
  });
};

module.exports = { getAcademicAssistant };
