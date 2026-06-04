const { inscripcion_sesion, sesion_estudio, estudiante: Estudiante, usuario } = require("../db/models");
const {
  ESTADOS_ACTIVOS,
  getEstudianteByUsuarioId,
  getSesionByIdOrFail,
} = require("./sesionEstudio.service");
const { crearNotificacion } = require("./notificacion.service");
const { sendMail } = require("./mailer.service");

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

  const fin = new Date(sesion.fecha_hora).getTime() +
    (sesion.duracion_minutos || 0) * 60 * 1000;
  if (Date.now() >= fin) {
    throw buildError("La sesion ya finalizo", 400);
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

  const inscripcion = await inscripcion_sesion.create({
    sesion_id: sesionId,
    estudiante_id: estudianteData.id,
    estado: estadoInicial,
    fecha_inscripcion: new Date(),
    notificado_recordatorio: false,
  });

  const usuarioData = await usuario.findByPk(usuarioId);
  const emailEstudiante = usuarioData?.email;

  const tituloNotif = estadoInicial === "aprobada"
    ? "Inscripción confirmada"
    : "Solicitud de inscripción enviada";

  const mensajeNotif = estadoInicial === "aprobada"
    ? `Te inscribiste correctamente a la sesión "${sesion.tema}".`
    : `Solicitaste inscripción a la sesión "${sesion.tema}". Espera la aprobación del creador.`;

  await crearNotificacion({
    usuario_id: usuarioId,
    titulo: tituloNotif,
    tipo: "session",
    mensaje: mensajeNotif,
    referencia_tipo: "sesion_estudio",
    referencia_id: sesion.id,
    action_url: "/student/study-sessions",
  });

  if (emailEstudiante) {
    const mensajeHtml = estadoInicial === "aprobada"
      ? `<p>Te inscribiste correctamente a la sesión <strong>"${sesion.tema}"</strong>.</p>`
      : `<p>Solicitaste inscripción a la sesión <strong>"${sesion.tema}"</strong>.</p>
         <p>Recibirás un correo cuando el creador apruebe o rechace tu solicitud.</p>`;

    await sendMail({
      to: emailEstudiante,
      subject: tituloNotif,
      html: `<p>Hola ${estudianteData.nombre},</p>${mensajeHtml}<p>Saludos,<br/>El equipo de SIVA</p>`,
    });
  }

  return inscripcion;
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

  const participante = await Estudiante.findByPk(inscripcion.estudiante_id, {
    include: [{ model: usuario, attributes: ["email"] }],
  });

  if (participante) {
    const emailParticipante = participante.usuario?.email;
    const esAprobado = estadoObjetivo === "aprobada";

    await crearNotificacion({
      usuario_id: participante.usuario_id,
      titulo: esAprobado ? "Inscripción aprobada" : "Inscripción rechazada",
      tipo: "session",
      mensaje: esAprobado
        ? `Tu solicitud para la sesión "${sesion.tema}" fue aprobada.`
        : `Tu solicitud para la sesión "${sesion.tema}" fue rechazada.`,
      referencia_tipo: "sesion_estudio",
      referencia_id: sesion.id,
      action_url: "/student/study-sessions",
    });

    if (emailParticipante) {
      await sendMail({
        to: emailParticipante,
        subject: esAprobado ? "Inscripción aprobada" : "Inscripción rechazada",
        html: `<p>Hola ${participante.nombre},</p>
               <p>Tu solicitud para la sesión <strong>"${sesion.tema}"</strong> fue <strong>${esAprobado ? "aprobada" : "rechazada"}</strong>.</p>
               <p>Saludos,<br/>El equipo de SIVA</p>`,
      });
    }
  }

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
