const { notificacion } = require("../db/models");

const TYPE_CONFIG = {
  academic: {
    category: "Académica",
    actionUrl: "/student/academic-status",
  },
  session: {
    category: "Sesión",
    actionUrl: "/student/study-sessions",
  },
  material: {
    category: "Material",
    actionUrl: "/student/materials",
  },
  general: {
    category: "General",
    actionUrl: null,
  },
};

const formatNotification = (row) => {
  const plain = row.get({ plain: true });
  const config = TYPE_CONFIG[plain.tipo] || {};

  return {
    id: plain.id,
    type: plain.tipo,
    category: config.category ?? "General",
    title: plain.titulo,
    message: plain.mensaje,
    date: plain.createdAt,
    read: Boolean(plain.leida),
    actionUrl: plain.action_url ?? config.actionUrl ?? null,
    referenceType: plain.referencia_tipo ?? null,
    referenceId: plain.referencia_id ?? null,
  };
};

const listarMisNotificaciones = async (req, res) => {
  const where = { usuario_id: req.user.sub };

  if (req.query.tipo) {
    where.tipo = req.query.tipo;
  }

  if (req.query.leida !== undefined) {
    where.leida = req.query.leida;
  }

  const rows = await notificacion.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  const data = rows.map(formatNotification);
  const unreadCount = data.filter((item) => !item.read).length;

  return res.status(200).json({
    ok: true,
    data,
    summary: {
      total: data.length,
      unreadCount,
    },
  });
};

module.exports = {
  listarMisNotificaciones,
};
