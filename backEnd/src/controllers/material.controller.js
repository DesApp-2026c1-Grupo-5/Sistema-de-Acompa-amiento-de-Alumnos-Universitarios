const {
  material,
  estudiante,
  valoracion,
  materia,
} = require("../db/models");
const { Op } = require("sequelize");

const listarMateriales = async (req, res, next) => {
  const { q, tipo, materia_id, suspendido = "false" } = req.query;

  const where = {};

  if (tipo) {
    where.tipo = tipo;
  }

  if (materia_id) {
    where.materia_id = materia_id;
  }

  if (suspendido !== "all") {
    where.suspendido = suspendido === "true";
  }

  if (q) {
    where[Op.or] = [
      { titulo: { [Op.like]: `%${q}%` } },
      { descripcion: { [Op.like]: `%${q}%` } },
    ];
  }

  const materiales = await material.findAll({
    where,
    include: [
      {
        model: estudiante,
        attributes: ["id", "nombre", "apellido"],
      },
      {
        model: materia,
        attributes: ["id", "nombre", "anio_cursada"],
      },
      {
        model: valoracion,
        attributes: ["valor"],
      },
    ],
    order: [["id", "DESC"]],
  });

  const data = materiales.map((item) => {
    const plain = item.get({ plain: true });
    const likes = plain.valoracions.filter((v) => v.valor === "like").length;
    const dislikes = plain.valoracions.filter((v) => v.valor === "dislike").length;

    return {
      ...plain,
      likes,
      dislikes,
    };
  });

  return res.status(200).json({
    ok: true,
    data,
  });
};

const obtenerMaterialPorId = async (req, res, next) => {
  const { id } = req.params;

  const materialData = await material.findByPk(id, {
    include: [
      {
        model: estudiante,
        attributes: ["id", "nombre", "apellido"],
      },
      {
        model: materia,
        attributes: ["id", "nombre", "anio_cursada"],
      },
      {
        model: valoracion,
        attributes: ["id", "valor", "fecha", "estudiante_id"],
      },
    ],
  });

  if (!materialData) {
    const error = new Error("Material no encontrado");
    error.statusCode = 404;
    return next(error);
  }

  const plain = materialData.get({ plain: true });

  return res.status(200).json({
    ok: true,
    data: {
      ...plain,
      likes: plain.valoracions.filter((v) => v.valor === "like").length,
      dislikes: plain.valoracions.filter((v) => v.valor === "dislike").length,
    },
  });
};

const crearMaterial = async (req, res, next) => {
  const {
    materia_id,
    tipo,
    titulo,
    descripcion,
    url_o_path,
    formato,
    subtipo_link,
    discord_servidor,
    discord_canal,
    size_bytes,
    suspendido,
  } = req.body;

  if (!materia_id || !tipo || !titulo || !url_o_path) {
    const error = new Error("materia_id, tipo, titulo y url_o_path son obligatorios");
    error.statusCode = 400;
    return next(error);
  }

  const materiaId = Number(materia_id);

  if (!Number.isInteger(materiaId) || materiaId <= 0) {
    const error = new Error("materia_id debe ser un entero positivo");
    error.statusCode = 400;
    return next(error);
  }

  if (!String(tipo).trim() || !String(titulo).trim() || !String(url_o_path).trim()) {
    const error = new Error("tipo, titulo y url_o_path no pueden estar vacios");
    error.statusCode = 400;
    return next(error);
  }

  if (size_bytes !== undefined) {
    const parsedSize = Number(size_bytes);

    if (!Number.isInteger(parsedSize) || parsedSize < 0) {
      const error = new Error("size_bytes debe ser un entero mayor o igual a 0");
      error.statusCode = 400;
      return next(error);
    }
  }

  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });

  if (!estudianteData) {
    const error = new Error("Estudiante no encontrado");
    error.statusCode = 404;
    return next(error);
  }

  const materiaData = await materia.findByPk(materiaId);

  if (!materiaData) {
    const error = new Error("Materia no encontrada");
    error.statusCode = 404;
    return next(error);
  }

  const nuevoMaterial = await material.create({
    materia_id: materiaId,
    estudiante_id: estudianteData.id,
    tipo,
    titulo,
    descripcion,
    url_o_path,
    formato,
    subtipo_link,
    discord_servidor,
    discord_canal,
    size_bytes,
    suspendido: suspendido ?? false,
  });

  return res.status(201).json({
    ok: true,
    data: nuevoMaterial,
  });
};

const votarMaterial = async (req, res, next) => {
  const { material_id, valor } = req.body;

  if (valor !== "like" && valor !== "dislike") {
    const error = new Error("Valor invalido");
    error.statusCode = 400;
    return next(error);
  }

  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });

  const votoExistente = await valoracion.findOne({
    where: {
      material_id,
      estudiante_id: estudianteData.id,
    },
  });

  if (votoExistente) {
    votoExistente.valor = valor;
    await votoExistente.save();

    return res.json({
      ok: true,
      message: "Voto actualizado",
      data: votoExistente,
    });
  }

  const voto = await valoracion.create({
    material_id,
    estudiante_id: estudianteData.id,
    valor,
    fecha: new Date(),
  });

  return res.status(201).json({
    ok: true,
    data: voto,
  });
};

module.exports = {
  listarMateriales,
  obtenerMaterialPorId,
  crearMaterial,
  votarMaterial,
};
