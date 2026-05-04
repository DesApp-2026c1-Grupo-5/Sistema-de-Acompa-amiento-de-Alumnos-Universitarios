const { post, estudiante } = require("../db/models");

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
    created_at: new Date(),
  });

  return res.status(201).json({
    ok: true,
    data: nuevoPost,
  });
};

const obtenerPosts = async (req, res, next) => {
  const posts = await post.findAll({
    include: {
      model: estudiante,
      attributes: ["id", "nombre", "apellido"],
    },
    order: [["created_at", "DESC"]],
  });

  return res.json({
    ok: true,
    data: posts,
  });
};

module.exports = {
  crearPost,
  obtenerPosts,
};