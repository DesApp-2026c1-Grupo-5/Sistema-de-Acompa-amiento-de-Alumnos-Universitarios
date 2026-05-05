const { estudiante, usuario } = require("../db/models");

const obtenerMiPerfil = async (req, res, next) => {
  try {
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

    return res.status(200).json({
      ok: true,
      data: estudianteData,
    });
  } catch (error) {
    return next(error);
  }
};

const actualizarMiPerfil = async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      foto_url,
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
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  obtenerMiPerfil,
  actualizarMiPerfil,
};
