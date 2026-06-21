const db = require("../db/models");
const { plan_cursada, plan_cursada_item } = db;

const listar = async (situacionId) =>
  plan_cursada.findAll({
    where: { situacion_id: situacionId },
    order: [["created_at", "DESC"]],
  });

const obtenerPorId = async (id, situacionId) =>
  plan_cursada.findOne({
    where: { id, situacion_id: situacionId },
    include: [
      {
        model: plan_cursada_item,
        include: [{ model: db.materia, attributes: ["id", "nombre", "anio_cursada", "carga_horaria_semanal"] }],
      },
    ],
  });

const crear = async (situacionId, nombre, items) =>
  db.sequelize.transaction(async (t) => {
    const pc = await plan_cursada.create(
      { situacion_id: situacionId, nombre, activo: true, created_at: new Date() },
      { transaction: t },
    );

    if (items && items.length > 0) {
      await plan_cursada_item.bulkCreate(
        items.map((item) => ({
          plan_id: pc.id,
          materia_id: item.materia_id,
          anio_proyectado: item.anio_proyectado,
          cuatrimestre_proyectado: item.cuatrimestre_proyectado,
        })),
        { transaction: t },
      );
    }

    const creado = await plan_cursada.findByPk(pc.id, {
      include: [{ model: plan_cursada_item }],
      transaction: t,
    });

    return creado;
  });

const eliminar = async (id, situacionId) =>
  db.sequelize.transaction(async (t) => {
    const pc = await plan_cursada.findOne({
      where: { id, situacion_id: situacionId },
      transaction: t,
    });
    if (!pc) return null;

    await plan_cursada_item.destroy({
      where: { plan_id: id },
      transaction: t,
    });

    await pc.destroy({ transaction: t });
    return pc;
  });

module.exports = { listar, obtenerPorId, crear, eliminar };
