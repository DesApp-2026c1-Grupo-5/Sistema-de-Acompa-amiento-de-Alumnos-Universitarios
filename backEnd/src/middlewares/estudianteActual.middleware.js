const { estudiante } = require("../db/models");

const cargarEstudianteActual = async (req, res, next) => {
  try {
    const est = await estudiante.findOne({ where: { usuario_id: req.user.sub } });
    if (!est) {
      return res.status(404).json({ ok: false, message: "Estudiante no encontrado" });
    }
    req.estudiante = est;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { cargarEstudianteActual };
