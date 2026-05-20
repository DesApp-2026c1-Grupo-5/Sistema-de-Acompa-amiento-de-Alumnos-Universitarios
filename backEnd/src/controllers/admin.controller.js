const { hashPassword } = require("../utils/password");
const db = require("../db/models");
const { usuario, administrador, sequelize } = db;

const crearAdmin = async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  const nuevo = await sequelize.transaction(async (t) => {
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
      { email, password_hash, tipo: "administrador", activo: true },
      { transaction: t }
    );

    const creador = await administrador.findOne({
      where: { usuario_id: req.user.sub },
      transaction: t,
    });

    const nuevoAdmin = await administrador.create(
      {
        usuario_id: nuevoUsuario.id,
        nombre,
        apellido,
        creado_por: creador?.id ?? null,
      },
      { transaction: t }
    );

    return { nuevoUsuario, nuevoAdmin };
  });

  return res.status(201).json({
    ok: true,
    data: {
      id: nuevo.nuevoAdmin.id,
      nombre: nuevo.nuevoAdmin.nombre,
      apellido: nuevo.nuevoAdmin.apellido,
      email: nuevo.nuevoUsuario.email,
      createdAt: nuevo.nuevoAdmin.createdAt,
    },
  });
};

const obtenerAdmins = async (req, res) => {
  const admins = await administrador.findAll({
    include: { model: usuario, attributes: ["email"] },
    order: [["createdAt", "DESC"]],
  });

  const data = admins.map((a) => {
    const plain = a.get({ plain: true });
    return {
      id: plain.id,
      nombre: plain.nombre,
      apellido: plain.apellido,
      email: plain.usuario?.email ?? "",
      createdAt: plain.createdAt,
    };
  });

  return res.json({ ok: true, data });
};

module.exports = { crearAdmin, obtenerAdmins };
