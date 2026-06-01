const {
  denuncia,
  motivo_denuncia,
  material,
  estudiante,
} = require("../db/models");

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

  return res.status(201).json({ ok: true, data: nueva });
};

module.exports = {
  listarMotivos,
  crearDenuncia,
};
