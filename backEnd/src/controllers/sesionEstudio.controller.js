const sesionEstudioService = require("../services/sesionEstudio.service");

const crearSesion = async (req, res) => {
  const sesion = await sesionEstudioService.crearSesion(req.body, req.user.sub);

  return res.status(201).json({
    ok: true,
    data: sesion,
  });
};

const listarSesiones = async (req, res) => {
  const result = await sesionEstudioService.listarSesiones(req.query, req.user.sub);

  return res.status(200).json({
    ok: true,
    data: result.data,
    pagination: result.pagination,
  });
};

const obtenerSesion = async (req, res) => {
  const data = await sesionEstudioService.obtenerSesionPorId(req.params.id, req.user.sub);

  return res.status(200).json({
    ok: true,
    data,
  });
};

const editarSesion = async (req, res) => {
  const data = await sesionEstudioService.editarSesion(req.params.id, req.body, req.user.sub);

  return res.status(200).json({
    ok: true,
    data,
  });
};

const cancelarSesion = async (req, res) => {
  const data = await sesionEstudioService.cancelarSesion(req.params.id, req.user.sub);

  return res.status(200).json({
    ok: true,
    data,
  });
};

module.exports = {
  crearSesion,
  listarSesiones,
  obtenerSesion,
  editarSesion,
  cancelarSesion,
};
