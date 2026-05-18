const { post, estudiante, voto_post } = require("../db/models");

const crearPost = async (req, res, next) => {
  const { contenido } = req.body;

  if (!contenido) {
    const error = new Error("El contenido es obligatorio");
    error.statusCode = 400;
    return next(error);
  }

  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });

  if (!estudianteData) {
    const error = new Error("Estudiante no encontrado");
    error.statusCode = 404;
    return next(error);
  }

  const nuevoPost = await post.create({
    contenido,
    estudiante_id: estudianteData.id,
  });

  return res.status(201).json({
    ok: true,
    data: nuevoPost,
  });
};

const obtenerPosts = async (req, res) => {
  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });
  const miEstudianteId = estudianteData?.id ?? null;

  const posts = await post.findAll({
    include: [
      { model: estudiante, attributes: ["id", "nombre", "apellido"] },
      { model: voto_post, attributes: ["tipo", "estudiante_id"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  const data = posts.map((p) => {
    const plain = p.get({ plain: true });
    const votos = plain.voto_posts ?? [];
    const likes = votos.filter((v) => v.tipo === "like").length;
    const dislikes = votos.filter((v) => v.tipo === "dislike").length;
    const mio = miEstudianteId
      ? votos.find((v) => v.estudiante_id === miEstudianteId)
      : null;
    delete plain.voto_posts;
    return { ...plain, likes, dislikes, mi_voto: mio?.tipo ?? null };
  });

  return res.json({
    ok: true,
    data,
  });
};

module.exports = {
  crearPost,
  obtenerPosts,
};