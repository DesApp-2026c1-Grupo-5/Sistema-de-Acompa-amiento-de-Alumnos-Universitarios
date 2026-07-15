const {
  material,
  estudiante,
  valoracion,
  materia,
  tag,
  denuncia,
  sequelize,
} = require("../db/models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const {
  construirNombreDescarga,
  construirPathAdministrado,
  decorarMaterialDto,
  eliminarArchivoSubido,
  existeArchivoRegular,
  obtenerExtensionNormalizada,
  obtenerInfoArchivoAdministrado,
  tieneFirmaValida,
} = require("../services/materialArchivo.service");

const TIPOS_EXTERNOS = new Set(["link", "video", "drive", "github", "discord"]);

const getMaterialIdsConDenunciaPendiente = async (miEstudianteId, materialIds) => {
  if (!miEstudianteId || materialIds.length === 0) return new Set();
  const filas = await denuncia.findAll({
    where: {
      denunciante_id: miEstudianteId,
      estado: "pendiente",
      material_id: { [Op.in]: materialIds },
    },
    attributes: ["material_id"],
  });
  return new Set(filas.map((f) => f.material_id));
};

const materialIncludes = [
  { model: estudiante, attributes: ["id", "nombre", "apellido", "foto_url"] },
  { model: materia, as: "materia", attributes: ["id", "nombre", "anio_cursada"] },
  { model: valoracion, attributes: ["valor", "estudiante_id"] },
  {
    model: tag,
    as: "tags",
    attributes: ["id", "nombre"],
    through: { attributes: [] },
  },
];

const getMiEstudianteId = async (req) => {
  const est = await estudiante.findOne({ where: { usuario_id: req.user.sub } });
  return est?.id ?? null;
};

const formatMaterial = (plain, miEstudianteId) => {
  const votos = plain.valoracions ?? [];
  const likes = votos.filter((v) => v.valor === "like").length;
  const dislikes = votos.filter((v) => v.valor === "dislike").length;
  const mio = miEstudianteId
    ? votos.find((v) => v.estudiante_id === miEstudianteId)
    : null;
  delete plain.valoracions;
  return decorarMaterialDto({
    ...plain,
    likes,
    dislikes,
    mi_voto: mio?.valor ?? null,
  });
};

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const asociarTags = async (materialData, tags, transaction) => {
  if (!Array.isArray(tags) || tags.length === 0) return;

  const nombres = [
    ...new Set(tags.map((nombre) => String(nombre).trim().toLowerCase()).filter(Boolean)),
  ];
  const tagIds = [];

  for (const nombre of nombres) {
    const [tagRow] = await tag.findOrCreate({
      where: { nombre },
      transaction,
    });
    tagIds.push(tagRow.id);
  }

  if (tagIds.length > 0) {
    await materialData.addTags(tagIds, { transaction });
  }
};

const parsearBodyArchivo = (body) => {
  const materiaId = Number(body.materia_id);
  if (!Number.isInteger(materiaId) || materiaId <= 0) {
    throw buildError("materia_id debe ser un entero positivo", 400);
  }

  const titulo = String(body.titulo ?? "").trim();
  if (!titulo) throw buildError("titulo es obligatorio", 400);
  if (titulo.length > 120) throw buildError("titulo puede tener hasta 120 caracteres", 400);

  const descripcion = String(body.descripcion ?? "").trim();
  if (descripcion.length > 255) {
    throw buildError("descripcion puede tener hasta 255 caracteres", 400);
  }

  let tags = [];
  if (body.tags !== undefined) {
    try {
      tags = JSON.parse(body.tags);
    } catch (error) {
      throw buildError("tags debe ser un JSON string valido", 400);
    }

    if (!Array.isArray(tags) || tags.some((nombre) => typeof nombre !== "string")) {
      throw buildError("tags debe ser un JSON string que represente un arreglo de textos", 400);
    }

    if (tags.length > 10 || tags.some((nombre) => nombre.trim().length > 40)) {
      throw buildError("Se permiten hasta 10 tags de 40 caracteres cada uno", 400);
    }
  }

  return { materiaId, titulo, descripcion, tags };
};

const listarMateriales = async (req, res) => {
  const { q, tipo, materia_id, suspendido } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const offset = (page - 1) * limit;

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

  const miEstudianteId = await getMiEstudianteId(req);

  const { count, rows } = await material.findAndCountAll({
    where,
    include: materialIncludes,
    order: [["id", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  const denunciadosSet = await getMaterialIdsConDenunciaPendiente(
    miEstudianteId,
    rows.map((r) => r.id)
  );

  const data = rows.map((item) => {
    const plain = item.get({ plain: true });
    return {
      ...formatMaterial(plain, miEstudianteId),
      mi_denuncia_pendiente: denunciadosSet.has(plain.id),
    };
  });

  return res.status(200).json({
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

const obtenerMaterialPorId = async (req, res, next) => {
  const { id } = req.params;

  const materialData = await material.findByPk(id, {
    include: materialIncludes,
  });

  if (!materialData) {
    const error = new Error("Material no encontrado");
    error.statusCode = 404;
    return next(error);
  }

  const miEstudianteId = await getMiEstudianteId(req);

  const denunciadosSet = await getMaterialIdsConDenunciaPendiente(miEstudianteId, [
    materialData.id,
  ]);

  return res.status(200).json({
    ok: true,
    data: {
      ...formatMaterial(materialData.get({ plain: true }), miEstudianteId),
      mi_denuncia_pendiente: denunciadosSet.has(materialData.id),
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
    tags,
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

  const tipoNormalizado = String(tipo).trim();
  const tituloNormalizado = String(titulo).trim();
  const urlPathNormalizado = String(url_o_path).trim();

  if (tipoNormalizado === "file") {
    return next(buildError("Los archivos deben subirse mediante /materiales/archivo", 400));
  }

  if (!TIPOS_EXTERNOS.has(tipoNormalizado)) {
    return next(buildError("tipo de material invalido", 400));
  }

  try {
    const parsedUrl = new URL(urlPathNormalizado);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("protocolo invalido");
    }
  } catch {
    return next(buildError("url_o_path debe ser una URL HTTP o HTTPS valida", 400));
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

  const payload = {
    materia_id: materiaId,
    estudiante_id: estudianteData.id,
    tipo: tipoNormalizado,
    titulo: tituloNormalizado,
    descripcion,
    url_o_path: urlPathNormalizado,
    formato,
    subtipo_link,
    discord_servidor,
    discord_canal,
    suspendido: false,
  };

  if (size_bytes !== undefined) {
    payload.size_bytes = Number(size_bytes);
  }

  const completo = await sequelize.transaction(async (transaction) => {
    const materiaData = await materia.findByPk(materiaId, { transaction });
    if (!materiaData) throw buildError("Materia no encontrada", 404);

    const nuevoMaterial = await material.create(payload, { transaction });
    await asociarTags(nuevoMaterial, tags, transaction);

    return material.findByPk(nuevoMaterial.id, {
      include: materialIncludes,
      transaction,
    });
  });

  return res.status(201).json({
    ok: true,
    data: {
      ...formatMaterial(completo.get({ plain: true }), estudianteData.id),
      mi_denuncia_pendiente: false,
    },
  });
};

const crearMaterialArchivo = async (req, res, next) => {
  try {
    const { materiaId, titulo, descripcion, tags } = parsearBodyArchivo(req.body);
    const extension = obtenerExtensionNormalizada(req.file.originalname);
    if (!(await tieneFirmaValida(req.file.path, extension))) {
      throw buildError("El contenido del archivo no coincide con su formato", 400);
    }
    const urlOPath = construirPathAdministrado(req.estudiante.id, req.file.filename);

    const completo = await sequelize.transaction(async (transaction) => {
      const materiaData = await materia.findByPk(materiaId, { transaction });
      if (!materiaData) throw buildError("Materia no encontrada", 404);

      const nuevoMaterial = await material.create(
        {
          materia_id: materiaId,
          estudiante_id: req.estudiante.id,
          tipo: "file",
          titulo,
          descripcion,
          url_o_path: urlOPath,
          formato: extension,
          size_bytes: req.file.size,
          suspendido: false,
        },
        { transaction }
      );

      await asociarTags(nuevoMaterial, tags, transaction);

      return material.findByPk(nuevoMaterial.id, {
        include: materialIncludes,
        transaction,
      });
    });

    return res.status(201).json({
      ok: true,
      data: {
        ...formatMaterial(completo.get({ plain: true }), req.estudiante.id),
        mi_denuncia_pendiente: false,
      },
    });
  } catch (error) {
    try {
      await eliminarArchivoSubido(req.file);
    } catch (cleanupError) {
      logger.error("crearMaterialArchivo.cleanup", cleanupError.message || cleanupError);
    }
    return next(error);
  }
};

const descargarMaterial = async (req, res, next) => {
  const materialId = Number(req.params.id);
  if (!Number.isInteger(materialId) || materialId <= 0) {
    return next(buildError("id de material invalido", 400));
  }

  const materialData = await material.findByPk(materialId);
  if (!materialData) return next(buildError("Material no encontrado", 404));
  if (materialData.tipo !== "file") {
    return next(buildError("El material solicitado no es un archivo", 400));
  }
  if (materialData.suspendido) {
    return next(buildError("El material se encuentra suspendido", 403));
  }

  const archivo = obtenerInfoArchivoAdministrado(materialData);
  if (!archivo) {
    return next(buildError("El material no tiene un archivo administrado disponible", 404));
  }
  if (!(await existeArchivoRegular(archivo.filePath))) {
    return next(buildError("El archivo del material no fue encontrado", 404));
  }

  const downloadName = construirNombreDescarga(
    materialData.titulo,
    archivo.extension,
    materialData.id
  );

  res.set({
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });

  return res.download(archivo.filePath, downloadName, (error) => {
    if (error) return next(error);
  });
};

const votarMaterial = async (req, res, next) => {
  const { material_id, valor } = req.body;

  const materialId = Number(material_id);

  if (!Number.isInteger(materialId) || materialId <= 0) {
    const error = new Error("material_id debe ser un entero positivo");
    error.statusCode = 400;
    return next(error);
  }

  if (valor !== "like" && valor !== "dislike") {
    const error = new Error("Valor invalido");
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

  const materialData = await material.findByPk(materialId);

  if (!materialData) {
    const error = new Error("Material no encontrado");
    error.statusCode = 404;
    return next(error);
  }

  if (materialData.suspendido) {
    const error = new Error("No se puede votar un material suspendido");
    error.statusCode = 400;
    return next(error);
  }

  const existente = await valoracion.findOne({
    where: {
      material_id: materialId,
      estudiante_id: estudianteData.id,
    },
  });

  let miVoto;
  if (!existente) {
    await valoracion.create({
      material_id: materialId,
      estudiante_id: estudianteData.id,
      valor,
      fecha: new Date(),
    });
    miVoto = valor;
  } else if (existente.valor === valor) {
    await existente.destroy();
    miVoto = null;
  } else {
    existente.valor = valor;
    await existente.save();
    miVoto = valor;
  }

  const todas = await valoracion.findAll({
    where: { material_id: materialId },
  });
  const likes = todas.filter((v) => v.valor === "like").length;
  const dislikes = todas.filter((v) => v.valor === "dislike").length;

  return res.json({
    ok: true,
    data: { likes, dislikes, mi_voto: miVoto },
  });
};

module.exports = {
  listarMateriales,
  obtenerMaterialPorId,
  crearMaterial,
  crearMaterialArchivo,
  descargarMaterial,
  votarMaterial,
};
