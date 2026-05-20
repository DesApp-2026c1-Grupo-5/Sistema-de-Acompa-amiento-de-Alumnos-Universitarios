const { materia } = require("../db/models");

const listarMaterias = async (req, res) => {
  const materias = await materia.findAll({
    attributes: ["id", "nombre", "anio_cursada"],
    order: [["nombre", "ASC"]],
  });

  return res.json({ ok: true, data: materias });
};

module.exports = { listarMaterias };
