const {
  denuncia,
  motivo_denuncia,
  material,
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

const crearDenuncia = async (req, res, next) => {
  const materialId = Number(req.params.id);

  if (!Number.isInteger(materialId) || materialId <= 0) {
    return next(buildError("id de material invalido", 400));
  }

  const { motivo_id, detalle } = req.body;

  const materialData = await material.findByPk(materialId);
  if (!materialData) {
    return next(buildError("Material no encontrado", 404));
  }

  const motivoData = await motivo_denuncia.findByPk(motivo_id);
  if (!motivoData || !motivoData.activo) {
    return next(buildError("Motivo no encontrado", 400));
  }

  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });
  if (!estudianteData) {
    return next(buildError("Estudiante no encontrado", 404));
  }

  if (materialData.estudiante_id === estudianteData.id) {
    return next(buildError("No podes denunciar tu propio material", 400));
  }

  const previa = await denuncia.findOne({
    where: {
      material_id: materialId,
      denunciante_id: estudianteData.id,
      estado: "pendiente",
    },
  });
  if (previa) {
    return next(
      buildError("Ya existe una denuncia pendiente de este material", 400)
    );
  }

  const nueva = await denuncia.create({
    material_id: materialId,
    denunciante_id: estudianteData.id,
    motivo_id,
    detalle: detalle ?? null,
    estado: "pendiente",
    admin_revisor_id: null,
    fecha_creacion: new Date(),
    fecha_resolucion: null,
  });

  const admins = await usuario.findAll({ where: { tipo: "administrador" } });

  for (const admin of admins) {
    await crearNotificacion({
      usuario_id: admin.id,
      titulo: "Nueva denuncia de material",
      tipo: "general",
      mensaje: `Se denunció el material "${materialData.titulo}". Revisa las denuncias pendientes.`,
      referencia_tipo: "denuncia",
      referencia_id: nueva.id,
      action_url: "/admin/moderation",
    });

    if (admin.email) {
      await sendMail({
        to: admin.email,
        subject: "Nueva denuncia de material",
        html: `<p>Se denunció el material <strong>"${materialData.titulo}"</strong>.</p>
               <p>Ingresa al panel de moderación para revisarla.</p>
               <p>Saludos,<br/>El equipo de SIVA</p>`,
      });
    }
  }

  return res.status(201).json({ ok: true, data: nueva });
};

module.exports = {
  listarMotivos,
  crearDenuncia,
};
