const { inscripcion_sesion, sesion_estudio } = require("../db/models");
const {
  ESTADOS_ACTIVOS,
  getEstudianteByUsuarioId,
  getSesionByIdOrFail,
} = require("./sesionEstudio.service");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const contarParticipantesActivos = async (sesionId) =>
  inscripcion_sesion.count({
    where: {
      sesion_id: sesionId,
      estado: ESTADOS_ACTIVOS,
    },
  });

const inscribirse = async (sesionId, usuarioId) => {
  const estudianteData = await getEstudianteByUsuarioId(usuarioId);
  const sesion = await getSesionByIdOrFail(sesionId);

  if (sesion.cancelada) {
    throw buildError("La sesion esta cancelada", 400);
  }

  if (sesion.creador_id === estudianteData.id) {
    throw buildError("No puede inscribirse a su propia sesion", 400);
  }

  const existente = await inscripcion_sesion.findOne({
    where: {
      sesion_id: sesionId,
      estudiante_id: estudianteData.id,
      estado: ["pendiente", ...ESTADOS_ACTIVOS],
    },
  });

  if (existente) {
    throw buildError("Ya tiene una inscripcion activa en esta sesion", 409);
  }

  const activos = await contarParticipantesActivos(sesionId);
  if (sesion.cupos_max && activos >= sesion.cupos_max) {
    throw buildError("No hay cupos disponibles", 400);
  }

  const estadoInicial = sesion.requiere_aprobacion ? "pendiente" : "aprobada";

  return inscripcion_sesion.create({
    sesion_id: sesionId,
    estudiante_id: estudianteData.id,
    estado: estadoInicial,
    fecha_inscripcion: new Date(),
    notificado_recordatorio: false,
  });
};

const cancelarMiInscripcion = async (sesionId, usuarioId) => {
  const estudianteData = await getEstudianteByUsuarioId(usuarioId);

  const inscripcion = await inscripcion_sesion.findOne({
    where: {
      sesion_id: sesionId,
      estudiante_id: estudianteData.id,
      estado: ["pendiente", ...ESTADOS_ACTIVOS],
    },
  });

  if (!inscripcion) {
    throw buildError("No tiene una inscripcion activa en esta sesion", 404);
  }

  await inscripcion.update({ estado: "cancelada" });
  return inscripcion;
};

const actualizarEstadoParticipante = async (sesionId, inscripcionId, usuarioId, estadoObjetivo) => {
  const estudianteData = await getEstudianteByUsuarioId(usuarioId);
  const sesion = await getSesionByIdOrFail(sesionId);

  if (sesion.creador_id !== estudianteData.id) {
    throw buildError("No tiene permisos para gestionar participantes", 403);
  }

  const inscripcion = await inscripcion_sesion.findOne({
    where: {
      id: inscripcionId,
      sesion_id: sesionId,
    },
  });

  if (!inscripcion) {
    throw buildError("Inscripcion no encontrada", 404);
  }

  if (estadoObjetivo === "aprobada") {
    const activos = await contarParticipantesActivos(sesionId);
    if (sesion.cupos_max && !ESTADOS_ACTIVOS.includes(inscripcion.estado) && activos >= sesion.cupos_max) {
      throw buildError("No hay cupos disponibles", 400);
    }
  }

  await inscripcion.update({ estado: estadoObjetivo });
  return inscripcion;
};

const aprobarParticipante = (sesionId, inscripcionId, usuarioId) =>
  actualizarEstadoParticipante(sesionId, inscripcionId, usuarioId, "aprobada");

const rechazarParticipante = (sesionId, inscripcionId, usuarioId) =>
  actualizarEstadoParticipante(sesionId, inscripcionId, usuarioId, "rechazada");

module.exports = {
  inscribirse,
  cancelarMiInscripcion,
  aprobarParticipante,
  rechazarParticipante,
};
