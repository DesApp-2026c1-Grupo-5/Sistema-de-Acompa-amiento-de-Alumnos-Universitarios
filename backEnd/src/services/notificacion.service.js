const { notificacion } = require("../db/models");

const crearNotificacion = async ({
  usuario_id,
  titulo,
  tipo,
  mensaje,
  referencia_tipo,
  referencia_id,
  action_url,
}) => {
  return notificacion.create({
    usuario_id,
    titulo,
    tipo,
    mensaje,
    referencia_tipo: referencia_tipo ?? null,
    referencia_id: referencia_id ?? null,
    action_url: action_url ?? null,
    leida: false,
  });
};

const crearNotificacionUnica = async (payload) => {
  const where = {
    usuario_id: payload.usuario_id,
    titulo: payload.titulo,
  };

  if (payload.tipo !== undefined) where.tipo = payload.tipo;
  if (payload.referencia_tipo !== undefined) where.referencia_tipo = payload.referencia_tipo;
  if (payload.referencia_id !== undefined) where.referencia_id = payload.referencia_id;

  const existente = await notificacion.findOne({ where });
  if (existente) {
    return { notificacion: existente, creada: false };
  }

  return { notificacion: await crearNotificacion(payload), creada: true };
};

module.exports = { crearNotificacion, crearNotificacionUnica };
