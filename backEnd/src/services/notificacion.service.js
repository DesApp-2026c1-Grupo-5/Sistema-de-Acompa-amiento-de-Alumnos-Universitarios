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

module.exports = { crearNotificacion };
