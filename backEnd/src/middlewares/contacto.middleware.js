const verificarReceptor = (req, res, next) => {
  if (req.contacto.estudiante_receptor_id !== req.estudiante.id) {
    return res.status(403).json({
      ok: false,
      message: "No tienes permiso para responder esta invitación",
    });
  }
  next();
};

const verificarPendiente = (req, res, next) => {
  if (req.contacto.estado !== "pendiente") {
    return res.status(400).json({
      ok: false,
      message: "La invitación ya fue procesada",
    });
  }
  next();
};

module.exports = { verificarReceptor, verificarPendiente };
