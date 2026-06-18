const { Op } = require("sequelize");
const {
  estudiante,
  usuario,
  post,
  voto_post,
  contacto,
  situacion_academica,
  estado_materia,
  plan_estudio,
  carrera,
} = require("../db/models");
const profileImagenService = require("../services/profileImagen.service");

const getInitials = (nombre = "", apellido = "") => {
  const a = nombre.trim()[0] || "";
  const b = apellido.trim()[0] || "";
  return `${a}${b}`.toUpperCase();
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
};

const buildAcademicStatus = async (estudianteId) => {
  const aprobadas = await estado_materia.count({
    include: [
      {
        model: situacion_academica,
        where: { estudiante_id: estudianteId },
        attributes: [],
      },
    ],
    where: {
      estado: {
        [Op.in]: ["aprobada", "aprobado", "promotionada", "promocionada"],
      },
    },
  });

  return `${aprobadas} materias aprobadas`;
};

const buildCareerLabel = async (estudianteId) => {
  const sit = await situacion_academica.findOne({
    where: { estudiante_id: estudianteId },
  });
  if (!sit) return "Carrera no definida";

  const plan = await plan_estudio.findByPk(sit.plan_id);
  if (!plan) return "Carrera no definida";

  const carreraData = await carrera.findByPk(plan.carrera_id);
  return carreraData?.nombre ?? "Carrera no definida";
};

const buildContacts = async (estudianteId) => {
  const contactosAceptados = await contacto.findAll({
    where: {
      estado: {
        [Op.in]: ["aceptado", "aceptada"],
      },
      [Op.or]: [
        { estudiante_solicitante_id: estudianteId },
        { estudiante_receptor_id: estudianteId },
      ],
    },
    include: [
      {
        model: estudiante,
        as: "solicitante",
        attributes: ["id", "nombre", "apellido", "foto_url"],
      },
      {
        model: estudiante,
        as: "receptor",
        attributes: ["id", "nombre", "apellido", "foto_url"],
      },
    ],
  });

  const contactos = contactosAceptados
    .map((row) => {
      const isSolicitante = row.estudiante_solicitante_id === estudianteId;
      const persona = isSolicitante ? row.receptor : row.solicitante;

      if (!persona) return null;

      return {
        id: persona.id,
        initials: getInitials(persona.nombre, persona.apellido),
        name: `${persona.nombre} ${persona.apellido}`.trim(),
        foto_url: persona.foto_url ?? null,
      };
    })
    .filter(Boolean);

  return contactos;
};

const buildPendingRequests = async (estudianteId) => {
  const pendientes = await contacto.findAll({
    where: {
      estado: "pendiente",
      estudiante_receptor_id: estudianteId,
    },
    include: [
      {
        model: estudiante,
        as: "solicitante",
        attributes: ["id", "nombre", "apellido", "foto_url"],
      },
    ],
  });

  return pendientes.map((row) => ({
    id: row.id,
    initials: getInitials(row.solicitante?.nombre, row.solicitante?.apellido),
    name: `${row.solicitante?.nombre ?? ""} ${row.solicitante?.apellido ?? ""}`.trim(),
    foto_url: row.solicitante?.foto_url ?? null,
    commonContacts: 0,
  }));
};

const buildPublications = async (estudianteId) => {
  const posts = await post.findAll({
    where: { estudiante_id: estudianteId },
    include: [
      { model: estudiante, attributes: ["id", "nombre", "apellido"] },
      { model: voto_post, attributes: ["tipo", "estudiante_id"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  const userReactions = {};

  const publications = posts.map((p) => {
    const plain = p.get({ plain: true });
    const votos = plain.voto_posts ?? [];
    const likes = votos.filter((v) => v.tipo === "like").length;
    const dislikes = votos.filter((v) => v.tipo === "dislike").length;
    const miVoto = votos.find((v) => v.estudiante_id === estudianteId)?.tipo ?? null;
    userReactions[plain.id] = miVoto;

    return {
      id: plain.id,
      authorId: plain.estudiante?.id ?? plain.estudiante_id,
      authorInitials: getInitials(plain.estudiante?.nombre, plain.estudiante?.apellido),
      authorImage: plain.estudiante?.foto_url ?? null,
      authorName: `${plain.estudiante?.nombre ?? ""} ${plain.estudiante?.apellido ?? ""}`.trim(),
      date: formatDate(plain.createdAt),
      content: plain.contenido,
      eventType: plain.event_type ?? null,
      eventSubject: plain.event_subject ?? null,
      likes,
      dislikes,
    };
  });

  return { publications, userReactions };
};

const sonContactos = async (estudianteIdA, estudianteIdB) => {
  if (!estudianteIdA || !estudianteIdB) return false;
  const existe = await contacto.findOne({
    where: {
      estado: "aceptado",
      [Op.or]: [
        { estudiante_solicitante_id: estudianteIdA, estudiante_receptor_id: estudianteIdB },
        { estudiante_solicitante_id: estudianteIdB, estudiante_receptor_id: estudianteIdA },
      ],
    },
  });
  return !!existe;
};

const obtenerMiPerfil = async (req, res, next) => {
  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
    include: [
      {
        model: usuario,
        attributes: ["id", "email", "tipo", "activo"],
      },
    ],
  });

  if (!estudianteData) {
    const error = new Error("Perfil de estudiante no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const contacts = await buildContacts(estudianteData.id);
  const pendingRequests = await buildPendingRequests(estudianteData.id);
  const { publications, userReactions } = await buildPublications(estudianteData.id);
  const career = await buildCareerLabel(estudianteData.id);
  const academicStatus = await buildAcademicStatus(estudianteData.id);

  return res.status(200).json({
    ok: true,
    data: {
      user: {
        initials: getInitials(estudianteData.nombre, estudianteData.apellido),
        name: `${estudianteData.nombre} ${estudianteData.apellido}`.trim(),
        career,
        location: null,
        email: estudianteData.usuario.email,
        academicStatus,
        bio: estudianteData.bio,
        contactsCount: contacts.length,
        foto_url: estudianteData.foto_url,
        banner_url: estudianteData.banner_url,
        privacidad: estudianteData.privacidad,
        pub_inscripciones: estudianteData.pub_inscripciones,
        pub_regularizaciones: estudianteData.pub_regularizaciones,
        pub_aprobaciones: estudianteData.pub_aprobaciones,
        email_visible: estudianteData.email_visible,
      },
      contacts: contacts.slice(0, 6),
      pendingRequests,
      publications,
      userReactions,
    },
  });
};

const obtenerPerfilPorId = async (req, res, next) => {
  const { id } = req.params;

  const estudianteData = await estudiante.findOne({
    where: { id },
    include: [
      {
        model: usuario,
        attributes: ["id", "email", "tipo", "activo"],
      },
    ],
  });

  if (!estudianteData) {
    const error = new Error("Perfil de estudiante no encontrado");
    error.statusCode = 404;
    throw error;
  }

  // Si el que pide es el dueño del perfil → acceso completo
  const requesterEstudiante = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });
  const esDueno = requesterEstudiante && requesterEstudiante.id === estudianteData.id;

  // Si el que pide es admin → acceso completo
  const esAdmin = req.user.tipo === "administrador";

  // Evaluar privacidad
  const privacidad = estudianteData.privacidad || "publico";
  const esPublico = privacidad === "publico";

  let puedeVer = esDueno || esAdmin || esPublico;

  if (!puedeVer && requesterEstudiante) {
    puedeVer = await sonContactos(requesterEstudiante.id, estudianteData.id);
  }

  if (!puedeVer) {
    return res.status(200).json({
      ok: true,
      data: {
        privado: true,
        user: {
          initials: getInitials(estudianteData.nombre, estudianteData.apellido),
          name: `${estudianteData.nombre} ${estudianteData.apellido}`.trim(),
          foto_url: estudianteData.foto_url,
          privacidad,
        },
        contacts: [],
        publications: [],
        userReactions: {},
      },
    });
  }

  const contacts = await buildContacts(estudianteData.id);
  const { publications, userReactions } = await buildPublications(estudianteData.id);
  const career = await buildCareerLabel(estudianteData.id);
  const academicStatus = await buildAcademicStatus(estudianteData.id);

  return res.status(200).json({
    ok: true,
    data: {
      privado: false,
      user: {
        initials: getInitials(estudianteData.nombre, estudianteData.apellido),
        name: `${estudianteData.nombre} ${estudianteData.apellido}`.trim(),
        career,
        location: null,
        email: !esDueno && estudianteData.email_visible === false ? null : estudianteData.usuario.email,
        academicStatus,
        bio: estudianteData.bio,
        contactsCount: contacts.length,
        foto_url: estudianteData.foto_url,
        banner_url: estudianteData.banner_url,
        privacidad,
        pub_inscripciones: estudianteData.pub_inscripciones,
        pub_regularizaciones: estudianteData.pub_regularizaciones,
        pub_aprobaciones: estudianteData.pub_aprobaciones,
        email_visible: estudianteData.email_visible,
      },
      contacts: contacts.slice(0, 6),
      publications,
      userReactions,
    },
  });
};

const obtenerContactos = async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    const error = new Error("id de estudiante invalido");
    error.statusCode = 400;
    throw error;
  }

  const target = await estudiante.findByPk(targetId);
  if (!target) {
    const error = new Error("Perfil de estudiante no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const requester = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });
  const esDueno = requester && requester.id === targetId;
  const esAdmin = req.user.tipo === "administrador";
  const esPublico = (target.privacidad || "publico") === "publico";

  let puedeVer = esDueno || esAdmin || esPublico;
  if (!puedeVer && requester) {
    puedeVer = await sonContactos(requester.id, targetId);
  }
  if (!puedeVer) {
    const error = new Error("No tiene permisos para ver estos contactos");
    error.statusCode = 403;
    throw error;
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 5));
  const offset = (page - 1) * limit;

  const { count, rows } = await contacto.findAndCountAll({
    where: {
      estado: { [Op.in]: ["aceptado", "aceptada"] },
      [Op.or]: [
        { estudiante_solicitante_id: targetId },
        { estudiante_receptor_id: targetId },
      ],
    },
    include: [
      { model: estudiante, as: "solicitante", attributes: ["id", "nombre", "apellido", "foto_url"] },
      { model: estudiante, as: "receptor", attributes: ["id", "nombre", "apellido", "foto_url"] },
    ],
    order: [["fecha_respuesta", "DESC"]],
    limit,
    offset,
  });

  const data = rows
    .map((row) => {
      const persona =
        row.estudiante_solicitante_id === targetId ? row.receptor : row.solicitante;
      if (!persona) return null;
      return {
        id: persona.id,
        initials: getInitials(persona.nombre, persona.apellido),
        name: `${persona.nombre} ${persona.apellido}`.trim(),
        foto_url: persona.foto_url ?? null,
      };
    })
    .filter(Boolean);

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

const actualizarMiPerfil = async (req, res, next) => {
  const {
    nombre,
    apellido,
    foto_url,
    bio,
    privacidad,
    pub_inscripciones,
    pub_regularizaciones,
    pub_aprobaciones,
  } = req.body;

  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });

  if (!estudianteData) {
    const error = new Error("Perfil de estudiante no encontrado");
    error.statusCode = 404;
    throw error;
  }

  await estudianteData.update({
    nombre: nombre ?? estudianteData.nombre,
    apellido: apellido ?? estudianteData.apellido,
    foto_url: foto_url ?? estudianteData.foto_url,
    bio: bio ?? estudianteData.bio,
    privacidad: privacidad ?? estudianteData.privacidad,
    pub_inscripciones: pub_inscripciones ?? estudianteData.pub_inscripciones,
    pub_regularizaciones:
      pub_regularizaciones ?? estudianteData.pub_regularizaciones,
    pub_aprobaciones: pub_aprobaciones ?? estudianteData.pub_aprobaciones,
  });

  return res.status(200).json({
    ok: true,
    data: estudianteData,
  });
};

const actualizarPrivacidadMiPerfil = async (req, res) => {
  const { privacidad, pub_inscripciones, pub_regularizaciones, pub_aprobaciones, email_visible } = req.body;

  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });

  if (!estudianteData) {
    const error = new Error("Perfil de estudiante no encontrado");
    error.statusCode = 404;
    throw error;
  }

  await estudianteData.update({
    privacidad: privacidad ?? estudianteData.privacidad,
    pub_inscripciones: pub_inscripciones ?? estudianteData.pub_inscripciones,
    pub_regularizaciones:
      pub_regularizaciones ?? estudianteData.pub_regularizaciones,
    pub_aprobaciones: pub_aprobaciones ?? estudianteData.pub_aprobaciones,
    email_visible: email_visible ?? estudianteData.email_visible,
  });

  return res.status(200).json({
    ok: true,
    data: estudianteData,
  });
};

const actualizarAvatarMiPerfil = async (req, res) => {
  const { foto_url } = req.body;

  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });

  if (!estudianteData) {
    const error = new Error("Perfil de estudiante no encontrado");
    error.statusCode = 404;
    throw error;
  }

  await estudianteData.update({
    foto_url: foto_url ?? estudianteData.foto_url,
  });

  return res.status(200).json({
    ok: true,
    data: estudianteData,
  });
};

const actualizarFotoMiPerfil = async (req, res) => {
  const foto_url = await profileImagenService.guardarImagenPerfil(
    req.estudiante,
    "foto_url",
    req.file
  );

  return res.status(200).json({ ok: true, data: { foto_url } });
};

const eliminarFotoMiPerfil = async (req, res) => {
  const foto_url = await profileImagenService.eliminarImagenPerfil(
    req.estudiante,
    "foto_url"
  );

  return res.status(200).json({ ok: true, data: { foto_url } });
};

const actualizarBannerMiPerfil = async (req, res) => {
  const banner_url = await profileImagenService.guardarImagenPerfil(
    req.estudiante,
    "banner_url",
    req.file
  );

  return res.status(200).json({ ok: true, data: { banner_url } });
};

const eliminarBannerMiPerfil = async (req, res) => {
  const banner_url = await profileImagenService.eliminarImagenPerfil(
    req.estudiante,
    "banner_url"
  );

  return res.status(200).json({ ok: true, data: { banner_url } });
};

module.exports = {
  obtenerMiPerfil,
  obtenerPerfilPorId,
  obtenerContactos,
  actualizarMiPerfil,
  actualizarPrivacidadMiPerfil,
  actualizarAvatarMiPerfil,
  actualizarFotoMiPerfil,
  eliminarFotoMiPerfil,
  actualizarBannerMiPerfil,
  eliminarBannerMiPerfil,
};
