const { Op } = require("sequelize");
const {
  sequelize,
  situacion_academica,
  materia,
  correlatividad,
  estado_materia,
  final,
} = require("../db/models");
const {
  normalizarEstadoMateria,
  obtenerIncumplimientos,
} = require("./correlatividadAcademica.service");

const conTransaccion = (transaction, callback) =>
  transaction ? callback(transaction) : sequelize.transaction(callback);

const sanearCorrelatividades = async (planId, dryRun, externalTransaction) =>
  conTransaccion(externalTransaction, async (transaction) => {
    const materias = await materia.findAll({
      ...(planId ? { where: { plan_id: planId } } : {}),
      attributes: ["id", "plan_id"],
      raw: true,
      transaction,
    });
    const materiaPorId = new Map(materias.map((item) => [Number(item.id), item]));
    const correlatividades = await correlatividad.findAll({
      order: [["id", "DESC"]],
      raw: true,
      transaction,
    });
    const relacionesConservadas = new Set();
    const conservadas = [];
    const invalidas = [];

    for (const relacion of correlatividades) {
      const materiaData = materiaPorId.get(Number(relacion.materia_id));
      if (!materiaData) continue;
      const requisito = materiaPorId.get(Number(relacion.materia_requisito_id));
      const key = `${relacion.materia_id}:${relacion.materia_requisito_id}`;
      const valida =
        requisito &&
        Number(materiaData.plan_id) === Number(requisito.plan_id) &&
        Number(relacion.materia_id) !== Number(relacion.materia_requisito_id) &&
        ["cursar", "aprobar"].includes(relacion.tipo) &&
        !relacionesConservadas.has(key);

      if (valida) {
        relacionesConservadas.add(key);
        conservadas.push({
          materiaId: Number(relacion.materia_id),
          requisitoId: Number(relacion.materia_requisito_id),
        });
      }
      else invalidas.push(relacion.id);
    }

    const graph = new Map([...materiaPorId.keys()].map((id) => [id, []]));
    conservadas.forEach((relacion) =>
      graph.get(relacion.materiaId)?.push(relacion.requisitoId)
    );
    const estadoVisita = new Map();
    const visitar = (materiaId) => {
      if (estadoVisita.get(materiaId) === 1) {
        const error = new Error("El plan contiene un ciclo de correlativas");
        error.statusCode = 409;
        throw error;
      }
      if (estadoVisita.get(materiaId) === 2) return;
      estadoVisita.set(materiaId, 1);
      for (const requisitoId of graph.get(materiaId) || []) visitar(requisitoId);
      estadoVisita.set(materiaId, 2);
    };
    for (const materiaId of graph.keys()) visitar(materiaId);

    if (!dryRun && invalidas.length > 0) {
      await correlatividad.destroy({
        where: { id: { [Op.in]: invalidas } },
        transaction,
      });
    }

    return invalidas.length;
  });

const repararSituacion = async (situacionId, dryRun, externalTransaction) =>
  conTransaccion(externalTransaction, async (transaction) => {
    const situacion = await situacion_academica.findByPk(situacionId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!situacion) return null;

    const [materias, estados] = await Promise.all([
      materia.findAll({
        where: { plan_id: situacion.plan_id },
        include: [
          {
            model: correlatividad,
            as: "correlatividades",
            attributes: ["materia_requisito_id", "tipo"],
            include: [
              {
                model: materia,
                as: "requisito",
                attributes: ["id", "codigo", "nombre"],
              },
            ],
          },
        ],
        transaction,
      }),
      estado_materia.findAll({
        where: { situacion_id: situacion.id },
        order: [["id", "DESC"]],
        transaction,
      }),
    ]);

    const materiaIds = new Set(materias.map((item) => Number(item.id)));
    const fueraDelPlan = estados.filter((item) => !materiaIds.has(Number(item.materia_id)));
    const conservarPorMateria = new Map();
    const duplicados = [];

    for (const estado of estados) {
      const materiaId = Number(estado.materia_id);
      if (!materiaIds.has(materiaId)) continue;
      if (conservarPorMateria.has(materiaId)) duplicados.push(estado);
      else conservarPorMateria.set(materiaId, estado);
    }

    const descartados = [...fueraDelPlan, ...duplicados];
    const descartadosIds = descartados.map((item) => item.id);
    let finalesEliminados = descartadosIds.length
      ? await final.count({
          where: { estado_materia_id: { [Op.in]: descartadosIds } },
          transaction,
        })
      : 0;

    if (!dryRun && descartadosIds.length > 0) {
      await final.destroy({
        where: { estado_materia_id: { [Op.in]: descartadosIds } },
        transaction,
      });
      await estado_materia.destroy({
        where: { id: { [Op.in]: descartadosIds } },
        transaction,
      });
    }

    const reseteados = [];
    const yaReseteados = new Set();
    let estadosNormalizados = 0;

    for (const [materiaId, estado] of conservarPorMateria.entries()) {
      const estadoOriginal = String(estado.estado || "").trim().toLowerCase();
      const estadoCanonico = normalizarEstadoMateria(estadoOriginal);
      if (estadoOriginal === estadoCanonico) continue;

      estadosNormalizados += 1;
      if (estadoCanonico === "pendiente") {
        const cantidadFinales = await final.count({
          where: { estado_materia_id: estado.id },
          transaction,
        });
        finalesEliminados += cantidadFinales;
        yaReseteados.add(materiaId);
        reseteados.push({
          materia_id: materiaId,
          estado_anterior: estado.estado,
          incumplimientos: [],
        });
        if (!dryRun) {
          await final.destroy({ where: { estado_materia_id: estado.id }, transaction });
          await estado.update(
            {
              estado: "pendiente",
              anio: null,
              cuatrimestre: null,
              nota: null,
              fecha: null,
            },
            { transaction }
          );
        }
      } else if (!dryRun) {
        await estado.update({ estado: estadoCanonico }, { transaction });
      }
      estado.estado = estadoCanonico;
    }

    const estadoPorMateria = new Map(
      materias.map((item) => [
        Number(item.id),
        normalizarEstadoMateria(conservarPorMateria.get(Number(item.id))?.estado),
      ])
    );

    while (true) {
      const incumplimientos = obtenerIncumplimientos(materias, estadoPorMateria);
      const materiaIdsInvalidas = [
        ...new Set(incumplimientos.map((item) => Number(item.materia_id))),
      ].filter((materiaId) => !yaReseteados.has(materiaId));
      if (materiaIdsInvalidas.length === 0) break;

      for (const materiaId of materiaIdsInvalidas) {
        yaReseteados.add(materiaId);
        estadoPorMateria.set(materiaId, "pendiente");
        const estado = conservarPorMateria.get(materiaId);
        if (!estado) continue;

        const cantidadFinales = await final.count({
          where: { estado_materia_id: estado.id },
          transaction,
        });
        finalesEliminados += cantidadFinales;
        reseteados.push({
          materia_id: materiaId,
          estado_anterior: estado.estado,
          incumplimientos: incumplimientos.filter(
            (item) => Number(item.materia_id) === materiaId
          ),
        });

        if (!dryRun) {
          await final.destroy({
            where: { estado_materia_id: estado.id },
            transaction,
          });
          await estado.update(
            {
              estado: "pendiente",
              anio: null,
              cuatrimestre: null,
              nota: null,
              fecha: null,
            },
            { transaction }
          );
        }
      }
    }

    return {
      situacion_id: situacion.id,
      plan_id: situacion.plan_id,
      estados_fuera_del_plan_eliminados: fueraDelPlan.length,
      estados_duplicados_eliminados: duplicados.length,
      estados_normalizados: estadosNormalizados,
      finales_eliminados: finalesEliminados,
      materias_reseteadas: reseteados,
    };
  });

const repararSituacionesAcademicas = async ({
  dryRun = false,
  planId = null,
  transaction = null,
} = {}) => {
  const correlatividadesEliminadas = await sanearCorrelatividades(
    planId,
    dryRun,
    transaction
  );
  const situaciones = await situacion_academica.findAll({
    ...(planId ? { where: { plan_id: planId } } : {}),
    attributes: ["id"],
    order: [["id", "ASC"]],
    raw: true,
    transaction,
  });
  const detalles = [];

  for (const situacion of situaciones) {
    const detalle = await repararSituacion(situacion.id, dryRun, transaction);
    if (detalle) detalles.push(detalle);
  }

  return {
    dry_run: dryRun,
    plan_id: planId,
    situaciones_revisadas: detalles.length,
    estados_fuera_del_plan_eliminados: detalles.reduce(
      (total, item) => total + item.estados_fuera_del_plan_eliminados,
      0
    ),
    estados_duplicados_eliminados: detalles.reduce(
      (total, item) => total + item.estados_duplicados_eliminados,
      0
    ),
    estados_normalizados: detalles.reduce(
      (total, item) => total + item.estados_normalizados,
      0
    ),
    correlatividades_eliminadas: correlatividadesEliminadas,
    finales_eliminados: detalles.reduce(
      (total, item) => total + item.finales_eliminados,
      0
    ),
    materias_reseteadas: detalles.reduce(
      (total, item) => total + item.materias_reseteadas.length,
      0
    ),
    detalles,
  };
};

module.exports = { repararSituacionesAcademicas };
