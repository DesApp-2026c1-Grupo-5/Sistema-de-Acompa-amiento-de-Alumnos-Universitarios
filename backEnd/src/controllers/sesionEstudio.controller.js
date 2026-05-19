const sesionEstudioService = require("../services/sesionEstudio.service");

const crearSesion = async (req, res, next) => {
  try {
    const sesion = await sesionEstudioService.crearSesion(req.body, req.user.sub);

    return res.status(201).json({
      ok: true,
      data: sesion,
    });
  } catch (error) {
    return next(error);
  }
};

const listarSesiones = async (req, res, next) => {
  try {
    const result = await sesionEstudioService.listarSesiones(req.query, req.user.sub);

    return res.status(200).json({
      ok: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const obtenerSesion = async (req, res, next) => {
  try {
    const data = await sesionEstudioService.obtenerSesionPorId(req.params.id, req.user.sub);

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const editarSesion = async (req, res, next) => {
  try {
    const data = await sesionEstudioService.editarSesion(req.params.id, req.body, req.user.sub);

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const cancelarSesion = async (req, res, next) => {
  try {
    const data = await sesionEstudioService.cancelarSesion(req.params.id, req.user.sub);

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  crearSesion,
  listarSesiones,
  obtenerSesion,
  editarSesion,
  cancelarSesion,
};
