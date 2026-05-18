const { signToken } = require("../utils/jwt");
const { comparePassword, hashPassword } = require("../utils/password");
const db = require("../db/models");
const { usuario, estudiante, administrador, sequelize } = db;

const PASSWORD_MIN_LENGTH = 6;

const splitNombreCompleto = (nombreCompleto) => {
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length < 2) return null;
  const [nombre, ...resto] = partes;
  return { nombre, apellido: resto.join(" ") };
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email y password son obligatorios");
    error.statusCode = 400;
    throw error;
  }

  const usuarioData = await usuario.findOne({
    where: { email },
    include: [
      { model: estudiante, attributes: ["id", "nombre", "apellido"] },
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

  if (!nombre_completo || !email || !password) {
    const error = new Error("Nombre completo, email y password son obligatorios");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    const error = new Error(`La password debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`);
    error.statusCode = 400;
    throw error;
  }

  const partes = splitNombreCompleto(nombre_completo);
  if (!partes) {
    const error = new Error("Ingresá nombre y apellido");
    error.statusCode = 400;
    throw error;
  }

  const emailNormalizado = email.trim().toLowerCase();

  const { nuevoUsuario, nuevoEstudiante } = await sequelize.transaction(async (t) => {
    const existente = await usuario.findOne({
      where: { email: emailNormalizado },
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
        email: emailNormalizado,
        password_hash,
        tipo: "estudiante",
        activo: true,
      },
      { transaction: t }
    );

    const nuevoEstudiante = await estudiante.create(
      {
        usuario_id: nuevoUsuario.id,
        nombre: partes.nombre,
        apellido: partes.apellido,
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
      },
      administrador: null,
    },
  });
};

const me = (req, res) => {
  return res.status(200).json({
    ok: true,
    user: req.user,
  });
};

module.exports = {
  login,
  register,
  me,
};
