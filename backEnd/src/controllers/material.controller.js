const {
  material,
  estudiante,
  valoracion,
} = require("../db/models");

const crearMaterial = async (req, res, next) => {
  const {
    materia_id,
    tipo,
    titulo,
    descripcion,
    url_o_path,
    formato,
  } = req.body;

  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });

  if (!estudianteData) {
    const error = new Error("Estudiante no encontrado");
    error.statusCode = 404;
    return next(error);
  }

  const nuevoMaterial = await material.create({
    materia_id,
    estudiante_id: estudianteData.id,
    tipo,
    titulo,
    descripcion,
    url_o_path,
    formato,
    suspendido: false,
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
  crearMaterial,
  votarMaterial,
};