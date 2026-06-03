const { motivo_denuncia, denuncia } = require("../db/models");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const listarMotivosAdmin = async (req, res) => {
  const motivos = await motivo_denuncia.findAll({
    order: [["id", "ASC"]],
  });

  return res.status(200).json({
    ok: true,
    data: motivos.map((m) => ({
      id: m.id,
      descripcion: m.descripcion,
      activo: m.activo,
    })),
  });
};

const crearMotivo = async (req, res) => {
  const { descripcion, activo } = req.body;

  const nuevo = await motivo_denuncia.create({
    descripcion,
    activo: activo ?? true,
  });

  return res.status(201).json({
    ok: true,
    data: {
      id: nuevo.id,
      descripcion: nuevo.descripcion,
      activo: nuevo.activo,
    },
  });
};

const editarMotivo = async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(buildError("id invalido", 400));
  }

  const motivo = await motivo_denuncia.findByPk(id);
  if (!motivo) {
    return next(buildError("Motivo no encontrado", 404));
  }

  const { descripcion, activo } = req.body;
  await motivo.update({
    descripcion,
    ...(activo !== undefined ? { activo } : {}),
  });

  return res.status(200).json({
    ok: true,
    data: {
      id: motivo.id,
      descripcion: motivo.descripcion,
      activo: motivo.activo,
    },
  });
};

const eliminarMotivo = async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(buildError("id invalido", 400));
  }

  const motivo = await motivo_denuncia.findByPk(id);
  if (!motivo) {
    return next(buildError("Motivo no encontrado", 404));
  }

  const cantidadDenuncias = await denuncia.count({
    where: { motivo_id: id },
  });
  if (cantidadDenuncias > 0) {
    return next(
      buildError(
        "El motivo tiene denuncias asociadas y no puede borrarse",
        409
      )
    );
  }

  await motivo.destroy();

  return res.status(200).json({
    ok: true,
    data: { id },
  });
};

module.exports = {
  listarMotivosAdmin,
  crearMotivo,
  editarMotivo,
  eliminarMotivo,
};
