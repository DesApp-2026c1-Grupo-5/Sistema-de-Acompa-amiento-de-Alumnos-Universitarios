const { Op } = require("sequelize");
const {
  sesion_estudio,
  estudiante,
  materia,
  inscripcion_sesion,
  usuario,
} = require("../db/models");

const ESTADOS_ACTIVOS = ["aprobada", "inscripto"];

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getEstudianteByUsuarioId = async (usuarioId) => {
  const estudianteData = await estudiante.findOne({
    where: { usuario_id: usuarioId },
    include: [{ model: usuario, attributes: ["email"] }],
  });

  if (!estudianteData) {
    throw buildError("Estudiante no encontrado", 404);
  }

  return estudianteData;
};

const getSesionByIdOrFail = async (id) => {
  const sesion = await sesion_estudio.findByPk(id);
  if (!sesion) {
    throw buildError("Sesion no encontrada", 404);
  }
  return sesion;
};

const validarTipoYUbicacion = ({ tipo, link_ubicacion }) => {
  if (tipo === "virtual" && !link_ubicacion) {
    throw buildError("Para sesiones virtuales, link_ubicacion es obligatorio", 400);
  }

  if (tipo === "presencial" && !link_ubicacion) {
    throw buildError("Para sesiones presenciales, link_ubicacion es obligatorio", 400);
  }
};

const crearSesion = async (payload, usuarioId) => {
  const estudianteData = await getEstudianteByUsuarioId(usuarioId);
  const materiaData = await materia.findByPk(payload.materia_id);

  if (!materiaData) {
    throw buildError("Materia no encontrada", 404);
  }

  validarTipoYUbicacion(payload);

  return sesion_estudio.create({
    ...payload,
    creador_id: estudianteData.id,
    cancelada: false,
  });
};

const editarSesion = async (sesionId, payload, usuarioId) => {
  const estudianteData = await getEstudianteByUsuarioId(usuarioId);
  const sesion = await getSesionByIdOrFail(sesionId);

  if (sesion.creador_id !== estudianteData.id) {
    throw buildError("No tiene permisos para editar esta sesion", 403);
  }

  if (sesion.cancelada) {
    throw buildError("No se puede editar una sesion cancelada", 400);
  }

  if (payload.materia_id) {
    const materiaData = await materia.findByPk(payload.materia_id);
    if (!materiaData) {
      throw buildError("Materia no encontrada", 404);
    }
  }

  const payloadFinal = { ...payload };
  if (payloadFinal.tipo || payloadFinal.link_ubicacion !== undefined) {
    validarTipoYUbicacion({
      tipo: payloadFinal.tipo ?? sesion.tipo,
      link_ubicacion: payloadFinal.link_ubicacion ?? sesion.link_ubicacion,
    });
  }

  await sesion.update(payloadFinal);
  return sesion;
};

const cancelarSesion = async (sesionId, usuarioId) => {
  const estudianteData = await getEstudianteByUsuarioId(usuarioId);
  const sesion = await getSesionByIdOrFail(sesionId);

  if (sesion.creador_id !== estudianteData.id) {
    throw buildError("No tiene permisos para cancelar esta sesion", 403);
  }

  if (sesion.cancelada) {
    return sesion;
  }

  await sesion.update({ cancelada: true });
  return sesion;
};

const normalizarSesion = (plain, miEstudianteId) => {
  const inscripciones = plain.inscripcion_sesions || [];
  const participantesCount = inscripciones.filter((i) => ESTADOS_ACTIVOS.includes(i.estado)).length;
  const miInscripcion = inscripciones.find((i) => i.estudiante_id === miEstudianteId);
  const userStatus = plain.creador_id === miEstudianteId
    ? "created"
    : miInscripcion?.estado === "pendiente"
      ? "pending"
      : ESTADOS_ACTIVOS.includes(miInscripcion?.estado)
        ? "joined"
        : "none";

  return {
    id: plain.id,
    materia_id: plain.materia_id,
    subject: plain.materium?.nombre ?? null,
    topic: plain.tema,
    type: plain.tipo,
    link_ubicacion: plain.link_ubicacion,
    dateTime: plain.fecha_hora,
    durationMinutes: plain.duracion_minutos,
    maxParticipants: plain.cupos_max,
    participantsCount,
    description: plain.descripcion,
    requiresApproval: plain.requiere_aprobacion,
    cancelled: plain.cancelada,
    creatorId: plain.creador_id,
    creatorName: plain.creador ? `${plain.creador.nombre} ${plain.creador.apellido}`.trim() : null,
    userStatus,
  };
};

const obtenerSesionPorId = async (sesionId, usuarioId) => {
  const estudianteData = await getEstudianteByUsuarioId(usuarioId);

  const sesion = await sesion_estudio.findByPk(sesionId, {
    include: [
      { model: estudiante, as: "creador", attributes: ["id", "nombre", "apellido"] },
      { model: materia, attributes: ["id", "nombre", "anio_cursada"] },
      { model: inscripcion_sesion, attributes: ["id", "estado", "estudiante_id"] },
    ],
  });

  if (!sesion) {
    throw buildError("Sesion no encontrada", 404);
  }

  return normalizarSesion(sesion.get({ plain: true }), estudianteData.id);
};

const listarSesiones = async (query, usuarioId) => {
  const estudianteData = await getEstudianteByUsuarioId(usuarioId);
  const where = {};

  if (query.materia_id) {
    where.materia_id = query.materia_id;
  }

  if (query.tipo) {
    where.tipo = query.tipo;
  }

  if (query.solo_disponibles === "true") {
    where.cancelada = false;
  }

  if (query.desde || query.hasta) {
    where.fecha_hora = {};
    if (query.desde) where.fecha_hora[Op.gte] = new Date(query.desde);
    if (query.hasta) where.fecha_hora[Op.lte] = new Date(query.hasta);
  }

  if (query.q) {
    where[Op.or] = [{ tema: { [Op.like]: `%${query.q}%` } }];
  }

  const { page, limit } = query;
  const offset = (page - 1) * limit;

  const { rows, count } = await sesion_estudio.findAndCountAll({
    where,
    include: [
      { model: estudiante, as: "creador", attributes: ["id", "nombre", "apellido"] },
      { model: materia, attributes: ["id", "nombre", "anio_cursada"] },
      { model: inscripcion_sesion, attributes: ["id", "estado", "estudiante_id"] },
    ],
    order: [["fecha_hora", "ASC"]],
    limit,
    offset,
    distinct: true,
  });

  let data = rows.map((s) => normalizarSesion(s.get({ plain: true }), estudianteData.id));

  if (query.disponibilidad === "con_cupo") {
    data = data.filter((s) => !s.maxParticipants || s.participantsCount < s.maxParticipants);
  }

  if (query.disponibilidad === "llenas") {
    data = data.filter((s) => s.maxParticipants && s.participantsCount >= s.maxParticipants);
  }

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

module.exports = {
  ESTADOS_ACTIVOS,
  getEstudianteByUsuarioId,
  getSesionByIdOrFail,
  crearSesion,
  editarSesion,
  cancelarSesion,
  obtenerSesionPorId,
  listarSesiones,
};
