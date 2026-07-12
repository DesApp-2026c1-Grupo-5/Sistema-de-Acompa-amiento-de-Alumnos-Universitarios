const { Op } = require("sequelize");

const { post, estudiante, voto_post, denuncia } = require("../db/models");

const getMiEstudianteId = async (req) => {
  const est = await estudiante.findOne({ where: { usuario_id: req.user.sub } });
  return est?.id ?? null;
};

const getPostIdsConDenunciaPendiente = async (miEstudianteId, postIds) => {
  if (!miEstudianteId || postIds.length === 0) return new Set();

  const filas = await denuncia.findAll({
    where: {
      denunciante_id: miEstudianteId,
      estado: "pendiente",
      post_id: { [Op.in]: postIds },
    },
    attributes: ["post_id"],
  });

  return new Set(filas.map((f) => f.post_id));
};

const formatPost = (plain, miEstudianteId) => {
  const votos = plain.voto_posts ?? [];
  const likes = votos.filter((v) => v.tipo === "like").length;
  const dislikes = votos.filter((v) => v.tipo === "dislike").length;
  const mio = miEstudianteId ? votos.find((v) => v.estudiante_id === miEstudianteId) : null;

  delete plain.voto_posts;

  return {
    ...plain,
    eventType: plain.event_type ?? null,
    eventSubject: plain.event_subject ?? null,
    likes,
    dislikes,
    mi_voto: mio?.tipo ?? null,
  };
};

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
  const miEstudianteId = await getMiEstudianteId(req);

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  const { count, rows } = await post.findAndCountAll({
    where: { oculto: false },
    include: [
      { model: estudiante, attributes: ["id", "nombre", "apellido", "foto_url"] },
      { model: voto_post, attributes: ["tipo", "estudiante_id"] },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  const denunciadosSet = await getPostIdsConDenunciaPendiente(
    miEstudianteId,
    rows.map((r) => r.id)
  );

  const data = rows.map((p) => {
    const plain = p.get({ plain: true });
    return {
      ...formatPost(plain, miEstudianteId),
      mi_denuncia_pendiente: denunciadosSet.has(plain.id),
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
      hasMore: offset + rows.length < count,
    },
  });
};

const obtenerPostPorId = async (req, res, next) => {
  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || postId <= 0) {
    const error = new Error("id de publicacion invalido");
    error.statusCode = 400;
    return next(error);
  }

  const postData = await post.findByPk(postId, {
    include: [
      { model: estudiante, attributes: ["id", "nombre", "apellido", "foto_url"] },
      { model: voto_post, attributes: ["tipo", "estudiante_id"] },
    ],
  });

  if (!postData) {
    const error = new Error("Publicacion no encontrada");
    error.statusCode = 404;
    return next(error);
  }

  const miEstudianteId = await getMiEstudianteId(req);
  const denunciadosSet = await getPostIdsConDenunciaPendiente(miEstudianteId, [postData.id]);
  const plain = postData.get({ plain: true });

  return res.status(200).json({
    ok: true,
    data: {
      ...formatPost(plain, miEstudianteId),
      mi_denuncia_pendiente: denunciadosSet.has(postData.id),
    },
  });
};

const eliminarPost = async (req, res, next) => {
  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || postId <= 0) {
    const error = new Error("id de publicacion invalido");
    error.statusCode = 400;
    return next(error);
  }

  const miEstudianteId = await getMiEstudianteId(req);
  if (!miEstudianteId) {
    const error = new Error("Estudiante no encontrado");
    error.statusCode = 404;
    return next(error);
  }

  const postData = await post.findByPk(postId);
  if (!postData) {
    const error = new Error("Publicacion no encontrada");
    error.statusCode = 404;
    return next(error);
  }

  if (postData.estudiante_id !== miEstudianteId) {
    const error = new Error("No tenés permisos para eliminar esta publicación");
    error.statusCode = 403;
    return next(error);
  }

  await voto_post.destroy({ where: { post_id: postId } });
  await denuncia.destroy({ where: { post_id: postId } });
  await postData.destroy();

  return res.status(200).json({ ok: true, data: { id: postId } });
};

module.exports = {
  crearPost,
  obtenerPosts,
  obtenerPostPorId,
  eliminarPost,
};
