const {
  plan_estudio,
  carrera,
  materia,
  correlatividad,
} = require("../db/models");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const obtenerPlan = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(buildError("id de plan invalido", 400));
  }

  const plan = await plan_estudio.findByPk(id, {
    include: [
      { model: carrera, attributes: ["id", "nombre"] },
      {
        model: materia,
        as: "materias",
        attributes: [
          "id",
          "codigo",
          "nombre",
          "anio_cursada",
          "modalidad",
          "es_optativa",
          "es_unahur",
          "creditos_otorga",
        ],
        include: [
          {
            model: correlatividad,
            as: "correlatividades",
            attributes: ["materia_requisito_id"],
            include: [
              {
                model: materia,
                as: "requisito",
                attributes: ["codigo"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!plan) {
    return next(buildError("Plan de estudio no encontrado", 404));
  }

  const plain = plan.get({ plain: true });
  const materias = plain.materias || [];

  const materiasFormatted = materias.map((m) => {
    const correlativas = (m.correlatividades || [])
      .map((c) => c.requisito?.codigo)
      .filter(Boolean);
    return {
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      anio_cursada: m.anio_cursada,
      modalidad: m.modalidad,
      es_optativa: m.es_optativa,
      es_unahur: m.es_unahur,
      creditos_otorga: m.creditos_otorga,
      correlativas,
    };
  });

  const materias_unahur = materias.filter((m) => m.es_unahur).length;

  return res.status(200).json({
    ok: true,
    data: {
      id: plain.id,
      carrera_id: plain.carrera_id,
      carrera_nombre: plain.carrera?.nombre ?? null,
      nombre: plain.nombre,
      anio: plain.anio,
      estado: plain.estado,
      creditos_requeridos: plain.creditos_requeridos,
      niveles_ingles_requeridos: plain.niveles_ingles_requeridos,
      materias_unahur,
      materias: materiasFormatted,
    },
  });
};

module.exports = {
  obtenerPlan,
};
