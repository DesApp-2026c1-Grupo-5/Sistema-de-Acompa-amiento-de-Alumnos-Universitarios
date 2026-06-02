const {
  sequelize,
  estudiante,
  materia,
  situacion_academica,
  estado_materia,
  post,
} = require("../db/models");

const ACCIONES = {
  inscripcion: {
    estado: "cursando",
    eventType: "enrollment",
    contenido: (nombreMateria) => `Me inscribí a ${nombreMateria}`,
    pubFlag: "pub_inscripciones",
  },
  regularizacion: {
    estado: "regular",
    eventType: "regular",
    contenido: (nombreMateria) => `Regularicé ${nombreMateria}`,
    pubFlag: "pub_regularizaciones",
  },
  aprobacion: {
    estado: "aprobada",
    eventType: "approved",
    contenido: (nombreMateria) => `Aprobé ${nombreMateria}`,
    pubFlag: "pub_aprobaciones",
  },
};

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getEstudianteByUsuarioId = async (usuarioId, transaction) => {
  return estudiante.findOne({
    where: { usuario_id: usuarioId },
    transaction,
  });
};

const getSituacionActiva = async (estudianteId, transaction) => {
  return situacion_academica.findOne({
    where: { estudiante_id: estudianteId },
    order: [
      ["fecha_inicio", "DESC"],
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
    transaction,
  });
};

const getMateriaById = async (materiaId, transaction) => {
  return materia.findByPk(materiaId, { transaction });
};

const normalizarFecha = (value) => {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const crearPostAcademico = async ({
  estudianteData,
  materiaData,
  accion,
  transaction,
}) => {
  const config = ACCIONES[accion];
  if (!config) {
    throw buildError("Accion academica invalida", 400);
  }

  if (!estudianteData?.[config.pubFlag]) {
    return null;
  }

  return post.create(
    {
      estudiante_id: estudianteData.id,
      contenido: config.contenido(materiaData.nombre),
      event_type: config.eventType,
      event_subject: materiaData.nombre,
    },
    { transaction }
  );
};

const registrarAccionAcademica = async (usuarioId, materiaId, accion, payload = {}) => {
  const config = ACCIONES[accion];
  if (!config) {
    throw buildError("Accion academica invalida", 400);
  }

  return sequelize.transaction(async (transaction) => {
    const estudianteData = await getEstudianteByUsuarioId(usuarioId, transaction);
    if (!estudianteData) {
      throw buildError("Estudiante no encontrado", 404);
    }

    const materiaData = await getMateriaById(materiaId, transaction);
    if (!materiaData) {
      throw buildError("Materia no encontrada", 404);
    }

    const situacion = await getSituacionActiva(estudianteData.id, transaction);
    if (!situacion) {
      throw buildError("Situacion academica no encontrada", 404);
    }

    const estadoExistente = await estado_materia.findOne({
      where: {
        situacion_id: situacion.id,
        materia_id: materiaData.id,
      },
      transaction,
    });

    const mismaAccion = estadoExistente?.estado === config.estado;
    const fecha = normalizarFecha(
      payload.fecha ?? (mismaAccion ? estadoExistente?.fecha : undefined)
    );
    const nextData = {
      estado: config.estado,
      anio: payload.anio ?? estadoExistente?.anio ?? materiaData.anio_cursada ?? null,
      cuatrimestre: payload.cuatrimestre ?? estadoExistente?.cuatrimestre ?? null,
      nota: payload.nota ?? estadoExistente?.nota ?? null,
      fecha,
    };

    let estadoMateriaData;
    let postData = null;

    if (estadoExistente) {
      const hasChanges =
        estadoExistente.estado !== nextData.estado ||
        estadoExistente.anio !== nextData.anio ||
        estadoExistente.cuatrimestre !== nextData.cuatrimestre ||
        estadoExistente.nota !== nextData.nota ||
        new Date(estadoExistente.fecha ?? 0).getTime() !== nextData.fecha.getTime();

      if (hasChanges) {
        await estadoExistente.update(nextData, { transaction });
      }

      estadoMateriaData = estadoExistente;

      if (!mismaAccion) {
        postData = await crearPostAcademico({
          estudianteData,
          materiaData,
          accion,
          transaction,
        });
      }
    } else {
      estadoMateriaData = await estado_materia.create(
        {
          situacion_id: situacion.id,
          materia_id: materiaData.id,
          ...nextData,
        },
        { transaction }
      );

      postData = await crearPostAcademico({
        estudianteData,
        materiaData,
        accion,
        transaction,
      });
    }

    return {
      estado_materia: estadoMateriaData.get({ plain: true }),
      publicacion: postData ? postData.get({ plain: true }) : null,
    };
  });
};

module.exports = {
  registrarAccionAcademica,
};
