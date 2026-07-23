const { Op, literal } = require("sequelize");
const {
  sesion_estudio,
  estudiante,
  materia,
  inscripcion_sesion,
  archivo_sesion_estudio,
  usuario,
} = require("../db/models");
const { crearNotificacion } = require("../services/notificacion.service");
const { sendMail } = require("../services/mailer.service");
const { renderTemplate } = require("../services/emailRenderer.service");

const ESTADOS_ACTIVOS = ["aprobada", "inscripto"];

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const notificarParticipantesSesion = async ({ sesionId, titulo, mensaje, emisor_usuario_id, templateName }) => {
  const sesion = await sesion_estudio.findByPk(sesionId, {
    attributes: ["tema", "fecha_hora", "duracion_minutos", "tipo", "link_ubicacion"],
  });

  const inscripciones = await inscripcion_sesion.findAll({
    where: {
      sesion_id: sesionId,
      estado: ["pendiente", ...ESTADOS_ACTIVOS],
    },
    include: [
      {
        model: estudiante,
        include: [{ model: usuario, attributes: ["email"] }],
      },
    ],
  });

  const variables = {
    titulo,
    tema: sesion?.tema ?? "",
    fecha_hora: sesion?.fecha_hora ? new Date(sesion.fecha_hora).toLocaleString("es-AR") : "",
    duracion_minutos: sesion?.duracion_minutos ?? "",
    tipo: sesion?.tipo ?? "",
    link_ubicacion: sesion?.link_ubicacion ?? "",
  };

  for (const inscripcion of inscripciones) {
    const participante = inscripcion.estudiante;
    if (!participante?.usuario_id) continue;

    await crearNotificacion({
      usuario_id: participante.usuario_id,
      emisor_usuario_id,
      titulo,
      tipo: "session",
      mensaje,
      referencia_tipo: "sesion_estudio",
      referencia_id: sesionId,
      action_url: "/student/study-sessions",
    });

    if (templateName && participante.usuario?.email) {
      const html = renderTemplate(templateName, { ...variables, nombre: participante.nombre ?? "" });
      await sendMail({
        to: participante.usuario.email,
        subject: titulo,
        html,
      });
    }
  }
};

const normalizarSesion = (plain, miEstudianteId) => {
  const inscripciones = plain.inscripcion_sesions || [];
  const participantsCount = inscripciones.filter((i) => ESTADOS_ACTIVOS.includes(i.estado)).length;
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
    creatorImage: plain.creador?.foto_url ?? null,
    userStatus,
  };
};

const getEstudianteByUsuarioId = async (usuarioId) => {
  const estudianteData = await estudiante.findOne({ where: { usuario_id: usuarioId } });
  return estudianteData;
};

const crearSesion = async (req, res, next) => {
  const estudianteData = await getEstudianteByUsuarioId(req.user.sub);

  if (!estudianteData) {
    return next(buildError("Estudiante no encontrado", 404));
  }

  const materiaData = await materia.findByPk(req.body.materia_id);
  if (!materiaData) {
    return next(buildError("Materia no encontrada", 404));
  }

  if ((req.body.tipo === "virtual" || req.body.tipo === "presencial") && !req.body.link_ubicacion) {
    return next(buildError("link_ubicacion es obligatorio para el tipo de sesion indicado", 400));
  }

  const sesion = await sesion_estudio.create({
    ...req.body,
    creador_id: estudianteData.id,
    cancelada: false,
  });

  return res.status(201).json({
    ok: true,
    data: sesion,
  });
};

const listarSesiones = async (req, res, next) => {
  const estudianteData = await getEstudianteByUsuarioId(req.user.sub);

  if (!estudianteData) {
    return next(buildError("Estudiante no encontrado", 404));
  }

  const { materia_id, tipo, desde, hasta, q, disponibilidad, solo_disponibles, vista, page, limit } = req.query;
  const me = estudianteData.id;
  const where = {};

  if (materia_id) where.materia_id = materia_id;
  if (tipo) where.tipo = tipo;
  if (solo_disponibles === "true") where.cancelada = false;
  if (desde || hasta) {
    where.fecha_hora = {};
    if (desde) where.fecha_hora[Op.gte] = new Date(desde);
    if (hasta) where.fecha_hora[Op.lte] = new Date(hasta);
  }
  if (q) {
    where[Op.or] = [
      {
        tema: {
          [Op.iLike]: `%${q}%`,
        },
      },
      {
        "$materium.nombre$": {
          [Op.iLike]: `%${q}%`,
        },
      },
    ];
  }

  // Excluir sesiones finalizadas (inicio + duracion ya paso)
  const andConds = [
    literal(`"fecha_hora" + ("duracion_minutos" * interval '1 minute') >= NOW()`),
  ];

  if (vista === "disponibles") {
    where.creador_id = { [Op.ne]: me };
    where.cancelada = false;
  } else if (vista === "mias") {
    const insc = await inscripcion_sesion.findAll({
      where: { estudiante_id: me },
      attributes: ["sesion_id"],
    });
    const ids = insc.map((i) => i.sesion_id);
    andConds.push({ [Op.or]: [{ creador_id: me }, { id: { [Op.in]: ids } }] });
  }

  where[Op.and] = andConds;

  const offset = (page - 1) * limit;
  const { rows, count } = await sesion_estudio.findAndCountAll({
    where,
    include: [
      {
        model: estudiante,
        as: "creador",
        attributes: ["id", "nombre", "apellido", "foto_url"],
      },
      {
        model: materia,
        attributes: ["id", "nombre", "anio_cursada"],
      },
      {
        model: inscripcion_sesion,
        attributes: ["id", "estado", "estudiante_id"],
      },
    ],
    order: [["fecha_hora", "ASC"]],
    limit,
    offset,
    distinct: true,
    subQuery: false,
  });

  let data = rows.map((s) => normalizarSesion(s.get({ plain: true }), estudianteData.id));

  if (disponibilidad === "con_cupo") {
    data = data.filter((s) => !s.maxParticipants || s.participantsCount < s.maxParticipants);
  }
  if (disponibilidad === "llenas") {
    data = data.filter((s) => s.maxParticipants && s.participantsCount >= s.maxParticipants);
  }

  return res.status(200).json({
    ok: true,
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
};

const obtenerSesion = async (req, res, next) => {
  const estudianteData = await getEstudianteByUsuarioId(req.user.sub);

  if (!estudianteData) {
    return next(buildError("Estudiante no encontrado", 404));
  }

  const sesion = await sesion_estudio.findByPk(req.params.id, {
    include: [
      { model: estudiante, as: "creador", attributes: ["id", "nombre", "apellido", "foto_url"] },
      { model: materia, attributes: ["id", "nombre", "anio_cursada"] },
      {
        model: inscripcion_sesion,
        attributes: ["id", "estado", "estudiante_id"],
        include: [
          { model: estudiante, attributes: ["id", "nombre", "apellido", "foto_url"] },
        ],
      },
      {
        model: archivo_sesion_estudio,
        as: "archivos",
        attributes: ["id", "nombre_original", "nombre_archivo", "mime_type", "size_bytes", "url_o_path", "createdAt"],
      },
    ],
  });

  if (!sesion) {
    return next(buildError("Sesion no encontrada", 404));
  }

  const plain = sesion.get({ plain: true });
  const base = normalizarSesion(plain, estudianteData.id);
  const esCreador = plain.creador_id === estudianteData.id;

  const pendingRequests = esCreador
    ? (plain.inscripcion_sesions || [])
      .filter((i) => i.estado === "pendiente")
      .map((i) => ({
        inscripcionId: i.id,
        estudianteId: i.estudiante_id,
        name: i.estudiante
          ? `${i.estudiante.nombre} ${i.estudiante.apellido}`.trim()
          : "Estudiante",
      }))
    : [];

  const participants = (plain.inscripcion_sesions || [])
    .filter((i) => ESTADOS_ACTIVOS.includes(i.estado))
    .map((i) => ({
      inscripcionId: i.id,
      estudianteId: i.estudiante_id,
      name: i.estudiante
        ? `${i.estudiante.nombre} ${i.estudiante.apellido}`.trim()
        : "Estudiante",
      foto_url: i.estudiante?.foto_url ?? null,
      estado: i.estado,
    }));

  const archivos = (plain.archivos || []).map((archivo) => ({
    id: archivo.id,
    nombreOriginal: archivo.nombre_original,
    nombreArchivo: archivo.nombre_archivo,
    mimeType: archivo.mime_type,
    sizeBytes: archivo.size_bytes,
    url: archivo.url_o_path,
    createdAt: archivo.createdAt,
  }));

  return res.status(200).json({
    ok: true,
    data: { ...base, pendingRequests, participants, archivos },
  });
};

const editarSesion = async (req, res, next) => {
  const estudianteData = await getEstudianteByUsuarioId(req.user.sub);
  if (!estudianteData) {
    return next(buildError("Estudiante no encontrado", 404));
  }

  const sesion = await sesion_estudio.findByPk(req.params.id);
  if (!sesion) {
    return next(buildError("Sesion no encontrada", 404));
  }

  if (sesion.creador_id !== estudianteData.id) {
    return next(buildError("No tiene permisos para editar esta sesion", 403));
  }

  if (sesion.cancelada) {
    return next(buildError("No se puede editar una sesion cancelada", 400));
  }

  if (req.body.materia_id) {
    const materiaData = await materia.findByPk(req.body.materia_id);
    if (!materiaData) {
      return next(buildError("Materia no encontrada", 404));
    }
  }

  const tipo = req.body.tipo ?? sesion.tipo;
  const linkUbicacion = req.body.link_ubicacion ?? sesion.link_ubicacion;
  if ((tipo === "virtual" || tipo === "presencial") && !linkUbicacion) {
    return next(buildError("link_ubicacion es obligatorio para el tipo de sesion indicado", 400));
  }

  await sesion.update(req.body);

  await notificarParticipantesSesion({
    sesionId: sesion.id,
    titulo: "Sesión modificada",
    mensaje: `La sesión "${sesion.tema}" fue modificada por su creador.`,
    emisor_usuario_id: req.user.sub,
    templateName: "sessionModified",
  });

  return res.status(200).json({
    ok: true,
    data: sesion,
  });
};

const cancelarSesion = async (req, res, next) => {
  const estudianteData = await getEstudianteByUsuarioId(req.user.sub);
  if (!estudianteData) {
    return next(buildError("Estudiante no encontrado", 404));
  }

  const sesion = await sesion_estudio.findByPk(req.params.id);
  if (!sesion) {
    return next(buildError("Sesion no encontrada", 404));
  }

  if (sesion.creador_id !== estudianteData.id) {
    return next(buildError("No tiene permisos para cancelar esta sesion", 403));
  }

  if (!sesion.cancelada) {
    await sesion.update({ cancelada: true });
  }

  await notificarParticipantesSesion({
    sesionId: sesion.id,
    titulo: "Sesión cancelada",
    mensaje: `La sesión "${sesion.tema}" fue cancelada por su creador.`,
    emisor_usuario_id: req.user.sub,
    templateName: "sessionCancelled",
  });

  return res.status(200).json({
    ok: true,
    data: sesion,
  });
};

module.exports = {
  crearSesion,
  listarSesiones,
  obtenerSesion,
  editarSesion,
  cancelarSesion,
};
