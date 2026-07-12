const { Op } = require("sequelize");
const { hashPassword } = require("../utils/password");
const db = require("../db/models");

const { usuario, administrador, estudiante, sequelize } = db;

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
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  const { count, rows } = await administrador.findAndCountAll({
    include: { model: usuario, attributes: ["email"] },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  const data = rows.map((a) => {
    const plain = a.get({ plain: true });

    return {
      id: plain.id,
      nombre: plain.nombre,
      apellido: plain.apellido,
      email: plain.usuario?.email ?? "",
      createdAt: plain.createdAt,
    };
  });

  return res.json({
    ok: true,
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
};

const buscarEstudiantes = async (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    20,
    Math.max(1, parseInt(req.query.limit, 10) || 5)
  );

  const estudiantes = await estudiante.findAll({
    include: {
      model: usuario,
      attributes: ["email", "activo", "tipo"],
      where: {
        tipo: "estudiante",
      },
      required: true,
    },
    order: [["id", "ASC"]],
  });

  const filtrados = estudiantes.filter((e) => {
    const plain = e.get({ plain: true });

    const nombreCompleto = `${plain.nombre || ""} ${
      plain.apellido || ""
    }`
      .trim()
      .toLowerCase();

    const nombreVisible = (
      plain.nombre_completo || ""
    ).toLowerCase();

    const email = (
      plain.usuario?.email || ""
    ).toLowerCase();

    if (!q) {
      return true;
    }

    return (
      nombreCompleto.includes(q) ||
      nombreVisible.includes(q) ||
      email.includes(q)
    );
  });

  const total = filtrados.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  const estudiantesPaginados = filtrados.slice(
    offset,
    offset + limit
  );

  const data = estudiantesPaginados.map((e) => {
    const plain = e.get({ plain: true });

    return {
      estudiante_id: plain.id,
      usuario_id: plain.usuario_id,
      nombre_completo:
        plain.nombre_completo ||
        `${plain.nombre || ""} ${
          plain.apellido || ""
        }`.trim() ||
        "Estudiante sin nombre",
      email: plain.usuario?.email ?? "",
      activo: plain.usuario?.activo ?? false,
    };
  });

  return res.json({
    ok: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  });
};

const eliminarAdmin = async (req, res) => {
  const { id } = req.params;

  const admin = await administrador.findByPk(id);

  if (!admin) {
    return res.status(404).json({
      ok: false,
      message: "Administrador no encontrado",
    });
  }

  if (admin.usuario_id === req.user.sub) {
    return res.status(400).json({
      ok: false,
      message: "No podés eliminar tu propia cuenta.",
    });
  }

  await sequelize.transaction(async (t) => {
    await administrador.destroy({
      where: { id },
      transaction: t,
    });

    await usuario.destroy({
      where: { id: admin.usuario_id },
      transaction: t,
    });
  });

  return res.json({
    ok: true,
    message: "Administrador eliminado correctamente",
  });
};

module.exports = {
  crearAdmin,
  obtenerAdmins,
  eliminarAdmin,
  buscarEstudiantes,
};