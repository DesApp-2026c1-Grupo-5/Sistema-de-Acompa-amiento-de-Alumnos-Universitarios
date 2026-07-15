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

const marcarComoLeida = async (req, res) => {
  if (!req.notificacion.leida) {
    await req.notificacion.update({ leida: true });
  }

  return res.status(200).json({
    ok: true,
    data: formatNotification(req.notificacion),
  });
};

const marcarTodasComoLeidas = async (req, res) => {
  const [actualizadas] = await notificacion.update(
    { leida: true },
    {
      where: {
        usuario_id: req.user.sub,
        leida: false,
      },
    }
  );

  return res.status(200).json({
    ok: true,
    data: {
      updatedCount: actualizadas,
    },
  });
};

const eliminarNotificacion = async (req, res) => {
  await req.notificacion.destroy();

  return res.status(200).json({
    ok: true,
    data: {
      id: req.notificacion.id,
    },
  });
};

module.exports = {
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
};
