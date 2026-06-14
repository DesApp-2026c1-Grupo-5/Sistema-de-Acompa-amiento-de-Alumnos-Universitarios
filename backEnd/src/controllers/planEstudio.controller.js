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

const crearPlan = async (req, res, next) => {
  const carreraId = Number(req.params.carreraId);

  if (!Number.isInteger(carreraId) || carreraId <= 0) {
    return next(buildError("id de carrera inválido", 400));
  }

  const { anio, estado, creditos_requeridos, niveles_ingles_requeridos } = req.body;

  try {
    const carreraExistente = await carrera.findByPk(carreraId);
    if (!carreraExistente) {
      return next(buildError("Carrera no encontrada", 404));
    }

    const nuevoPlan = await plan_estudio.create({
      carrera_id: carreraId,
      nombre: `${carreraExistente.nombre} ${anio}`,
      anio,
      estado: estado || "vigente",
      creditos_requeridos,
      niveles_ingles_requeridos,
    });

    return res.status(201).json({
      ok: true,
      data: {
        id: nuevoPlan.id,
        anio: nuevoPlan.anio,
        estado: nuevoPlan.estado,
        creditos_requeridos: nuevoPlan.creditos_requeridos,
        niveles_ingles_requeridos: nuevoPlan.niveles_ingles_requeridos,
        carrera_id: nuevoPlan.carrera_id,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const actualizarPlan = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(buildError("id de plan inválido", 400));
  }

  const { estado } = req.body;

  try {
    const existente = await plan_estudio.findByPk(id);
    if (!existente) {
      return next(buildError("Plan de estudio no encontrado", 404));
    }

    await existente.update({ estado: estado ?? existente.estado });

    return res.status(200).json({
      ok: true,
      data: {
        id: existente.id,
        anio: existente.anio,
        estado: existente.estado,
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  obtenerPlan,
  crearPlan,
  actualizarPlan,
};
