const {
  denuncia,
  motivo_denuncia,
  material,
  post,
  estudiante,
  usuario,
} = require("../db/models");

const { crearNotificacion } = require("../services/notificacion.service");
const { sendMail } = require("../services/mailer.service");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getEstudianteActual = async (req) => {
  return estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });
};

const crearDenunciaParaRecurso = ({
  modelo,
  foreignKey,
  recursoNombre,
  articulo,
  notificacionTitulo,
  emailSubject,
  resumenKey,
  ownMessage,
  duplicateMessage,
  notFoundMessage,
}) => async (req, res, next) => {
  const recursoId = Number(req.params.id);

  if (!Number.isInteger(recursoId) || recursoId <= 0) {
    return next(buildError(`id de ${recursoNombre.toLowerCase()} invalido`, 400));
  }

  const { motivo_id, detalle } = req.body;

  const recurso = await modelo.findByPk(recursoId);
  if (!recurso) {
    return next(buildError(notFoundMessage, 404));
  }

  const motivoData = await motivo_denuncia.findByPk(motivo_id);
  if (!motivoData || !motivoData.activo) {
    return next(buildError("Motivo no encontrado", 400));
  }

  const estudianteData = await getEstudianteActual(req);
  if (!estudianteData) {
    return next(buildError("Estudiante no encontrado", 404));
  }

  if (recurso.estudiante_id === estudianteData.id) {
    return next(buildError(ownMessage, 400));
  }

  const previa = await denuncia.findOne({
    where: {
      [foreignKey]: recursoId,
      denunciante_id: estudianteData.id,
      estado: "pendiente",
    },
  });

  if (previa) {
    return next(buildError(duplicateMessage, 400));
  }

  const nueva = await denuncia.create({
    [foreignKey]: recursoId,
    denunciante_id: estudianteData.id,
    motivo_id,
    detalle: detalle ?? null,
    estado: "pendiente",
    admin_revisor_id: null,
    fecha_creacion: new Date(),
    fecha_resolucion: null,
  });

  const admins = await usuario.findAll({ where: { tipo: "administrador" } });
  const resumen = String(recurso[resumenKey] ?? recursoNombre).trim() || recursoNombre;

  for (const admin of admins) {
    await crearNotificacion({
      usuario_id: admin.id,
      titulo: notificacionTitulo,
      tipo: "general",
      mensaje: `Se denunció ${articulo} ${recursoNombre.toLowerCase()} "${resumen}". Revisa las denuncias pendientes.`,
      referencia_tipo: "denuncia",
      referencia_id: nueva.id,
      action_url: "/admin/moderation",
    });

    if (admin.email) {
      await sendMail({
        to: admin.email,
        subject: emailSubject,
        html: `<p>Se denunció ${articulo} ${recursoNombre.toLowerCase()} <strong>"${resumen}"</strong>.</p>
               <p>Ingresa al panel de moderación para revisarlo.</p>
               <p>Saludos,<br/>El equipo de SIVA</p>`,
      });
    }
  }

  return res.status(201).json({ ok: true, data: nueva });
};

const listarMotivos = async (req, res) => {
  const motivos = await motivo_denuncia.findAll({
    where: { activo: true },
    order: [["id", "ASC"]],
  });

  const data = motivos.map((m) => ({
    id: m.id,
    nombre: m.descripcion,
  }));

  return res.status(200).json({ ok: true, data });
};

const crearDenunciaMaterial = crearDenunciaParaRecurso({
  modelo: material,
  foreignKey: "material_id",
  recursoNombre: "Material",
  articulo: "el",
  notificacionTitulo: "Nueva denuncia de material",
  emailSubject: "Nueva denuncia de material",
  resumenKey: "titulo",
  ownMessage: "No podes denunciar tu propio material",
  duplicateMessage: "Ya existe una denuncia pendiente de este material",
  notFoundMessage: "Material no encontrado",
});

const crearDenunciaPost = crearDenunciaParaRecurso({
  modelo: post,
  foreignKey: "post_id",
  recursoNombre: "Publicación",
  articulo: "la",
  notificacionTitulo: "Nueva denuncia de publicación",
  emailSubject: "Nueva denuncia de publicación",
  resumenKey: "contenido",
  ownMessage: "No podes denunciar tu propia publicación",
  duplicateMessage: "Ya existe una denuncia pendiente de esta publicación",
  notFoundMessage: "Publicación no encontrada",
});

module.exports = {
  listarMotivos,
  crearDenunciaMaterial,
  crearDenunciaPost,
};
