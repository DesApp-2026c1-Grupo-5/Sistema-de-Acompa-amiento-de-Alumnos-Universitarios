const { materia, plan_estudio } = require("../db/models");

const listarMaterias = async (req, res) => {
  const materias = await materia.findAll({
    attributes: ["id", "nombre", "anio_cursada"],
    order: [["nombre", "ASC"]],
  });

  return res.json({ ok: true, data: materias });
};

const listarMateriasAdmin = async (req, res) => {
  const materias = await materia.findAll({
    attributes: [
      "id",
      "codigo",
      "nombre",
      "anio_cursada",
      "modalidad",
      "es_optativa",
      "es_unahur",
      "creditos_otorga",
    ],
    include: [{ model: plan_estudio, attributes: ["nombre"] }],
    order: [["nombre", "ASC"]],
  });

  const data = materias.map((m) => {
    const plain = m.get({ plain: true });
    return {
      id: plain.id,
      codigo: plain.codigo,
      nombre: plain.nombre,
      anio_cursada: plain.anio_cursada,
      modalidad: plain.modalidad,
      es_optativa: plain.es_optativa,
      es_unahur: plain.es_unahur,
      creditos_otorga: plain.creditos_otorga,
      plan_nombre: plain.plan_estudio?.nombre ?? null,
    };
  });

  return res.json({ ok: true, data });
};

module.exports = { listarMaterias, listarMateriasAdmin };
