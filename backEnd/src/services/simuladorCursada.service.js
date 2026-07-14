const { materia, correlatividad } = require("../db/models");

const mapearArea = (m) => {
  if (m.es_unahur) return "UNAHUR";
  if (m.es_optativa) return "Optativa";
  switch ((m.tipo || "").toLowerCase()) {
    case "tecnológica básica":
    case "tecnologica basica":
      return "CB";
    case "tecnológica aplicada":
    case "tecnologica aplicada":
      return "TA";
    case "complementaria":
      return "COMP";
    default:
      return "Otros";
  }
};

const mapearMateria = (m) => ({
  id: Number(m.id),
  year: m.anio_cursada,
  area: mapearArea(m),
  name: m.nombre,
  correlatives: (m.correlatividades || []).map((c) =>
    Number(c.materia_requisito_id)
  ),
  correlativeRequirements: (m.correlatividades || []).map((c) => ({
    subjectId: Number(c.materia_requisito_id),
    type: c.tipo,
  })),
  cuatrimestre: m.cuatrimestre,
  hours: m.carga_horaria_semanal || 6,
});

const obtenerMateriasConCorrelativas = async (planId) => {
  const materias = await materia.findAll({
    where: { plan_id: planId },
    include: [
      {
        model: correlatividad,
        as: "correlatividades",
        attributes: ["materia_requisito_id", "tipo"],
      },
    ],
    order: [
      ["anio_cursada", "ASC"],
      ["cuatrimestre", "ASC"],
      ["nombre", "ASC"],
    ],
  });

  return {
    subjects: materias.map(mapearMateria),
  };
};

module.exports = { mapearMateria, obtenerMateriasConCorrelativas };
