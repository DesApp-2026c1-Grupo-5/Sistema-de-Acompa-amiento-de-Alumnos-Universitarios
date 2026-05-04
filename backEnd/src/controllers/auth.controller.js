const { signToken } = require("../utils/jwt");

const DEMO_USER = {
  id: "1",
  email: "admin@demo.com",
  password: "123456",
  tipo: "administrador",
};

const login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Email y password son obligatorios");
      error.statusCode = 400;
      throw error;
    }

    if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
      const error = new Error("Credenciales invalidas");
      error.statusCode = 401;
      throw error;
    }

    const payload = {
      sub: DEMO_USER.id,
      email: DEMO_USER.email,
      tipo: DEMO_USER.tipo,
    };

    const token = signToken(payload);

    return res.status(200).json({
      ok: true,
      token,
      user: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        tipo: DEMO_USER.tipo,
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
