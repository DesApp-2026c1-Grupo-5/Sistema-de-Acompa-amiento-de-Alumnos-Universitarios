const { signToken } = require("../utils/jwt");
const { usuario, estudiante, administrador } = require("../db/models");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Email y password son obligatorios");
      error.statusCode = 400;
      throw error;
    }

    const usuarioData = await usuario.findOne({
      where: { email },
      include: [
        {
          model: estudiante,
          attributes: ["id", "nombre", "apellido"],
        },
        {
          model: administrador,
          attributes: ["id", "nombre", "apellido"],
        },
      ],
    });

    if (!usuarioData) {
      const error = new Error("Credenciales invalidas");
      error.statusCode = 401;
      throw error;
    }

    if (!usuarioData.activo) {
      const error = new Error("Usuario inactivo");
      error.statusCode = 403;
      throw error;
    }

    if (usuarioData.password_hash !== password) {
      const error = new Error("Credenciales invalidas");
      error.statusCode = 401;
      throw error;
    }

    const payload = {
      sub: usuarioData.id,
      email: usuarioData.email,
      tipo: usuarioData.tipo,
    };

    const token = signToken(payload);

    return res.status(200).json({
      ok: true,
      token,
      user: {
        id: usuarioData.id,
        email: usuarioData.email,
        tipo: usuarioData.tipo,
        estudiante: usuarioData.estudiante,
        administrador: usuarioData.administrador,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const me = (req, res) => {
  return res.status(200).json({
    ok: true,
    user: req.user,
  });
};

module.exports = {
  login,
  me,
};
