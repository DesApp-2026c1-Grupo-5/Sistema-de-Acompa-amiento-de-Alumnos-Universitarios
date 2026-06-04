const { signToken } = require("../utils/jwt");
const { comparePassword, hashPassword } = require("../utils/password");
const db = require("../db/models");
const { usuario, estudiante, administrador, sequelize } = db;

const splitNombreCompleto = (nombreCompleto) => {
  const [nombre, ...resto] = nombreCompleto.trim().split(/\s+/);
  return { nombre, apellido: resto.join(" ") };
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const usuarioData = await usuario.findOne({
    where: { email },
    include: [
      { model: estudiante, attributes: ["id", "nombre", "apellido", "foto_url"] },
      { model: administrador, attributes: ["id", "nombre", "apellido"] },
    ],
  });

  if (!usuarioData || !usuarioData.activo) {
    const error = new Error("Credenciales invalidas");
    error.statusCode = 401;
    throw error;
  }

  const passwordOk = await comparePassword(password, usuarioData.password_hash);

  if (!passwordOk) {
    const error = new Error("Credenciales invalidas");
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({
    sub: usuarioData.id,
    email: usuarioData.email,
    tipo: usuarioData.tipo,
  });

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
};

const register = async (req, res) => {
  const { nombre_completo, email, password } = req.body;
  const { nombre, apellido } = splitNombreCompleto(nombre_completo);

  const { nuevoUsuario, nuevoEstudiante } = await sequelize.transaction(async (t) => {
    const existente = await usuario.findOne({
      where: { email },
      transaction: t,
    });

    if (existente) {
      const error = new Error("El email ya está registrado");
      error.statusCode = 409;
      throw error;
    }

    const password_hash = await hashPassword(password);

    const nuevoUsuario = await usuario.create(
      {
        email,
        password_hash,
        tipo: "estudiante",
        activo: true,
      },
      { transaction: t }
    );

    const nuevoEstudiante = await estudiante.create(
      {
        usuario_id: nuevoUsuario.id,
        nombre,
        apellido,
        privacidad: "publico",
        pub_inscripciones: true,
        pub_regularizaciones: true,
        pub_aprobaciones: true,
      },
      { transaction: t }
    );

    return { nuevoUsuario, nuevoEstudiante };
  });

  const token = signToken({
    sub: nuevoUsuario.id,
    email: nuevoUsuario.email,
    tipo: nuevoUsuario.tipo,
  });

  return res.status(201).json({
    ok: true,
    token,
    user: {
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
      tipo: nuevoUsuario.tipo,
      estudiante: {
        id: nuevoEstudiante.id,
        nombre: nuevoEstudiante.nombre,
        apellido: nuevoEstudiante.apellido,
        foto_url: nuevoEstudiante.foto_url ?? null,
      },
      administrador: null,
    },
  });
};

const me = async (req, res) => {
  const usuarioData = await usuario.findByPk(req.user.sub, {
    include: [
      { model: estudiante, attributes: ["id", "nombre", "apellido", "foto_url"] },
      { model: administrador, attributes: ["id", "nombre", "apellido"] },
    ],
  });

  if (!usuarioData) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return res.status(200).json({
    ok: true,
    user: {
      id: usuarioData.id,
      email: usuarioData.email,
      tipo: usuarioData.tipo,
      estudiante: usuarioData.estudiante,
      administrador: usuarioData.administrador,
    },
  });
};

module.exports = {
  login,
  register,
  me,
};
