const verificarPropietario = (req, res, next) => {
  const notificacion = req.notificacion;

  if (Number(notificacion.usuario_id) !== Number(req.user.sub)) {
    return res.status(403).json({
      ok: false,
      message: "No tiene permisos para esta notificacion",
    });
  }

  return next();
};

module.exports = { verificarPropietario };
