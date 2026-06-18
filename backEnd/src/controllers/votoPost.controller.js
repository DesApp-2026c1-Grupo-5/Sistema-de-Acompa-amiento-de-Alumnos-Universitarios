const { post, voto_post, estudiante } = require('../db/models');
const { crearNotificacion } = require('../services/notificacion.service');

const votarPost = async (req, res, next) => {
  const postId = Number(req.params.id);
  const { tipo } = req.body;

  if (!['like', 'dislike'].includes(tipo)) {
    const error = new Error('El tipo debe ser "like" o "dislike"');
    error.statusCode = 400;
    return next(error);
  }

  const postData = await post.findByPk(postId, {
    include: [{ model: estudiante, attributes: ['id', 'usuario_id', 'nombre', 'apellido'] }],
  });
  if (!postData) {
    const error = new Error('Post no encontrado');
    error.statusCode = 404;
    return next(error);
  }

  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });
  if (!estudianteData) {
    const error = new Error('Estudiante no encontrado');
    error.statusCode = 404;
    return next(error);
  }

  const existente = await voto_post.findOne({
    where: { post_id: postId, estudiante_id: estudianteData.id },
  });

  let miVoto;
  if (!existente) {
    await voto_post.create({
      post_id: postId,
      estudiante_id: estudianteData.id,
      tipo,
    });
    miVoto = tipo;
  } else if (existente.tipo === tipo) {
    await existente.destroy();
    miVoto = null;
  } else {
    existente.tipo = tipo;
    await existente.save();
    miVoto = tipo;
  }

  if (miVoto === 'like' && postData.estudiante?.usuario_id !== estudianteData.id) {
    await crearNotificacion({
      usuario_id: postData.estudiante.usuario_id,
      titulo: 'Te dieron like',
      tipo: 'general',
      mensaje: 'Recibiste un like en una publicación tuya.',
      referencia_tipo: 'post',
      referencia_id: postData.id,
      action_url: '/student/home',
    });
  }

  const todos = await voto_post.findAll({ where: { post_id: postId } });
  const likes = todos.filter((v) => v.tipo === 'like').length;
  const dislikes = todos.filter((v) => v.tipo === 'dislike').length;

  return res.json({
    ok: true,
    data: { likes, dislikes, mi_voto: miVoto },
  });
};

module.exports = { votarPost };
