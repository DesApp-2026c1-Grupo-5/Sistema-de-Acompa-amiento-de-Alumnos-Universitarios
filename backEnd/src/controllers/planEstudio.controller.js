const {
  plan_estudio,
  carrera,
  materia,
  correlatividad,
  estado_materia,
  sequelize,
  Sequelize,
} = require("../db/models");

const { Op } = Sequelize;

const planEstudioService = require("../services/planEstudio.service");
const {
  repararSituacionesAcademicas,
} = require("../services/saneamientoAcademico.service");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const obtenerPlanFormateado = async (id) => {
  const plan = await plan_estudio.findByPk(id, {
    include: [
      { model: carrera, attributes: ["id", "nombre"] },
      {
        model: materia,
        as: "materias",
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
        include: [
          {
            model: correlatividad,
            as: "correlatividades",
            attributes: ["materia_requisito_id", "tipo"],
            include: [
              {
                model: materia,
                as: "requisito",
                attributes: ["codigo"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!plan) return null;

  const plain = plan.get({ plain: true });
  const materias = plain.materias || [];

  const materiasFormatted = materias.map((m) => {
    const correlativas = (m.correlatividades || [])
      .map((c) =>
        c.requisito?.codigo
          ? { codigo: c.requisito.codigo, tipo: c.tipo || "cursar" }
          : null
      )
      .filter(Boolean);
    return {
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      anio_cursada: m.anio_cursada,
      modalidad: m.modalidad,
      es_optativa: m.es_optativa,
      es_unahur: m.es_unahur,
      creditos_otorga: m.creditos_otorga,
      correlativas,
    };
  });

  return {
    id: plain.id,
    carrera_id: plain.carrera_id,
    carrera_nombre: plain.carrera?.nombre ?? null,
    nombre: plain.nombre,
    anio: plain.anio,
    estado: plain.estado,
    creditos_requeridos: plain.creditos_requeridos,
    niveles_ingles_requeridos: plain.niveles_ingles_requeridos,
    materias_unahur: plain.materias_unahur ?? 0,
    materias: materiasFormatted,
  };
};

const obtenerPlan = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(buildError("id de plan invalido", 400));
  }

  const data = await planEstudioService.getPlanById(id);
  return res.status(200).json({ ok: true, data });
};

const crearPlan = async (req, res, next) => {
  const carreraId = Number(req.params.carreraId);

  if (!Number.isInteger(carreraId) || carreraId <= 0) {
    return next(buildError("id de carrera inválido", 400));
  }

  const { anio, estado, creditos_requeridos, niveles_ingles_requeridos, materias = [] } = req.body;

  const carreraExistente = await carrera.findByPk(carreraId);
  if (!carreraExistente) {
    return next(buildError("Carrera no encontrada", 404));
  }

  let materiasNormalizadas;
  try {
    materiasNormalizadas = planEstudioService.validarMateriasPayload(materias);
  } catch (err) {
    return next(err);
  }

  const nuevoPlan = await sequelize.transaction(async (t) => {
    const plan = await plan_estudio.create(
      {
        carrera_id: carreraId,
        nombre: `${carreraExistente.nombre} ${anio}`,
        anio,
        estado: estado || "vigente",
        creditos_requeridos,
        niveles_ingles_requeridos,
      },
      { transaction: t }
    );

    if (materiasNormalizadas.length > 0) {
      const materiasCreadas = [];
      for (const m of materiasNormalizadas) {
        const nueva = await materia.create(
          {
            plan_id: plan.id,
            codigo: m.codigo,
            nombre: m.nombre,
            anio_cursada: m.anio_cursada,
            tipo: m.es_optativa ? "optativa" : "obligatoria",
            modalidad: m.modalidad,
            es_optativa: m.es_optativa,
            es_unahur: m.es_unahur,
            creditos_otorga: m.creditos_otorga,
          },
          { transaction: t }
        );
        materiasCreadas.push({ codigo: m.codigo, id: nueva.id });
      }

      const codigoToId = Object.fromEntries(materiasCreadas.map((m) => [m.codigo, m.id]));
      for (const m of materiasNormalizadas) {
        for (const correlativa of m.correlativas || []) {
          await correlatividad.create(
            {
              materia_id: codigoToId[m.codigo],
              materia_requisito_id: codigoToId[correlativa.codigo],
              tipo: correlativa.tipo,
            },
            { transaction: t }
          );
        }
      }
    }

    return plan;
  });

  if (materiasNormalizadas.length > 0) {
    const data = await obtenerPlanFormateado(nuevoPlan.id);
    return res.status(201).json({ ok: true, data });
  }

  return res.status(201).json({
    ok: true,
    data: {
      id: nuevoPlan.id,
      anio: nuevoPlan.anio,
      estado: nuevoPlan.estado,
      creditos_requeridos: nuevoPlan.creditos_requeridos,
      niveles_ingles_requeridos: nuevoPlan.niveles_ingles_requeridos,
      carrera_id: nuevoPlan.carrera_id,
    },
  });
};

const actualizarPlan = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(buildError("id de plan inválido", 400));
  }

  const data = await planEstudioService.actualizarPlan(id, req.body);
  return res.status(200).json({ ok: true, data });
};

const actualizarPlanCompleto = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(buildError("id de plan inválido", 400));
  }

  const {
    estado,
    creditos_requeridos,
    niveles_ingles_requeridos,
    materias_unahur,
    materias = [],
  } = req.body;

  let materiasNormalizadas;
  try {
    materiasNormalizadas = planEstudioService.validarMateriasPayload(materias);
  } catch (err) {
    return next(err);
  }

  try {
    const plan = await plan_estudio.findByPk(id, {
      include: [{ model: materia, as: "materias", attributes: ["id", "codigo"] }],
    });
    if (!plan) {
      return next(buildError("Plan de estudio no encontrado", 404));
    }

    await sequelize.transaction(async (t) => {
      await plan.update(
        {
          estado: estado ?? plan.estado,
          creditos_requeridos,
          niveles_ingles_requeridos,
          materias_unahur,
        },
        { transaction: t }
      );

      const existentes = plan.materias || [];
      const existentesByCodigo = new Map(existentes.map((m) => [m.codigo, m]));
      const existentesById = new Map(existentes.map((m) => [Number(m.id), m]));
      const oldIds = existentes.map((m) => m.id);

      // El id estable evita que un cambio de código recree la materia y su trayectoria.
      const codigoToId = {};
      const idsConservados = new Set();
      for (const m of materiasNormalizadas) {
        const datos = {
          codigo: m.codigo,
          nombre: m.nombre,
          anio_cursada: m.anio_cursada,
          tipo: m.es_optativa ? "optativa" : "obligatoria",
          modalidad: m.modalidad,
          es_optativa: m.es_optativa,
          es_unahur: m.es_unahur,
          creditos_otorga: m.creditos_otorga,
        };
        const existente = m.id
          ? existentesById.get(Number(m.id))
          : existentesByCodigo.get(m.codigo);
        if (m.id && !existente) {
          throw buildError("La materia indicada no pertenece al plan de estudio", 400);
        }
        if (existente) {
          await existente.update(datos, { transaction: t });
          codigoToId[m.codigo] = existente.id;
          idsConservados.add(Number(existente.id));
        } else {
          const creada = await materia.create(
            { plan_id: id, codigo: m.codigo, ...datos },
            { transaction: t }
          );
          codigoToId[m.codigo] = creada.id;
          idsConservados.add(Number(creada.id));
        }
      }

      // Bajas: materias del plan que ya no están en el payload.
      const removedIds = existentes
        .filter((m) => !idsConservados.has(Number(m.id)))
        .map((m) => m.id);

      if (removedIds.length > 0) {
        const estadosAsociados = await estado_materia.count({
          where: { materia_id: { [Op.in]: removedIds } },
          transaction: t,
        });
        if (estadosAsociados > 0) {
          throw buildError(
            "No se pueden eliminar materias con trayectoria académica asociada",
            409
          );
        }
      }

      // Limpiar correlatividades de todas las materias del plan (viejas ∪ nuevas)
      const allIds = [...new Set([...oldIds, ...Object.values(codigoToId)])];
      if (allIds.length > 0) {
        await correlatividad.destroy({
          where: {
            [Op.or]: [
              { materia_id: { [Op.in]: allIds } },
              { materia_requisito_id: { [Op.in]: allIds } },
            ],
          },
          transaction: t,
        });
      }

      if (removedIds.length > 0) {
        await materia.destroy({
          where: { id: { [Op.in]: removedIds } },
          transaction: t,
        });
      }

      // Recrear correlatividades desde el payload
      for (const m of materiasNormalizadas) {
        for (const correlativa of m.correlativas || []) {
          await correlatividad.create(
            {
              materia_id: codigoToId[m.codigo],
              materia_requisito_id: codigoToId[correlativa.codigo],
              tipo: correlativa.tipo,
            },
            { transaction: t }
          );
        }
      }
      await repararSituacionesAcademicas({ planId: id, transaction: t });
    });

    const data = await obtenerPlanFormateado(id);
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
};

const agregarMateriaAlPlan = async (req, res, next) => {
  const planId = Number(req.params.planId);

  if (!Number.isInteger(planId) || planId <= 0) {
    return next(buildError("id de plan inválido", 400));
  }

  const data = await planEstudioService.agregarMateria(planId, req.body);
  return res.status(201).json({ ok: true, data });
};

const actualizarMateriaDelPlan = async (req, res, next) => {
  const planId = Number(req.params.planId);
  const materiaId = Number(req.params.materiaId);

  if (!Number.isInteger(planId) || planId <= 0) {
    return next(buildError("id de plan inválido", 400));
  }
  if (!Number.isInteger(materiaId) || materiaId <= 0) {
    return next(buildError("id de materia inválido", 400));
  }

  const data = await planEstudioService.actualizarMateria(planId, materiaId, req.body);
  return res.status(200).json({ ok: true, data });
};

const eliminarMateriaDelPlan = async (req, res, next) => {
  const planId = Number(req.params.planId);
  const materiaId = Number(req.params.materiaId);

  if (!Number.isInteger(planId) || planId <= 0) {
    return next(buildError("id de plan inválido", 400));
  }
  if (!Number.isInteger(materiaId) || materiaId <= 0) {
    return next(buildError("id de materia inválido", 400));
  }

  const data = await planEstudioService.eliminarMateria(planId, materiaId);
  return res.status(200).json({ ok: true, data });
};

module.exports = {
  obtenerPlan,
  crearPlan,
  actualizarPlan,
  actualizarPlanCompleto,
  agregarMateriaAlPlan,
  actualizarMateriaDelPlan,
  eliminarMateriaDelPlan,
};
