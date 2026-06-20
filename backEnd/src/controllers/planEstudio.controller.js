const {
  plan_estudio,
  carrera,
  materia,
  correlatividad,
  sequelize,
  Sequelize,
} = require("../db/models");

const { Op } = Sequelize;

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
            attributes: ["materia_requisito_id"],
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
      .map((c) => c.requisito?.codigo)
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

  const data = await obtenerPlanFormateado(id);

  if (!data) {
    return next(buildError("Plan de estudio no encontrado", 404));
  }

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

  if (materias.length > 0) {
    const codigos = materias.map((m) => m.codigo);
    const set = new Set(codigos);
    if (set.size !== codigos.length) {
      return next(buildError("Hay códigos de materia duplicados en el payload", 400));
    }
    for (const m of materias) {
      for (const corr of m.correlativas || []) {
        if (!set.has(corr)) {
          return next(
            buildError(
              `La correlativa "${corr}" de la materia "${m.codigo}" no coincide con ninguna materia del plan`,
              400
            )
          );
        }
      }
    }
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

    if (materias.length > 0) {
      const materiasCreadas = [];
      for (const m of materias) {
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
      for (const m of materias) {
        for (const corrCodigo of m.correlativas || []) {
          await correlatividad.create(
            {
              materia_id: codigoToId[m.codigo],
              materia_requisito_id: codigoToId[corrCodigo],
              tipo: "cursar",
            },
            { transaction: t }
          );
        }
      }
    }

    return plan;
  });

  if (materias.length > 0) {
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

  const { estado } = req.body;

  try {
    const existente = await plan_estudio.findByPk(id);
    if (!existente) {
      return next(buildError("Plan de estudio no encontrado", 404));
    }

    await existente.update({ estado: estado ?? existente.estado });

    return res.status(200).json({
      ok: true,
      data: {
        id: existente.id,
        anio: existente.anio,
        estado: existente.estado,
      },
    });
  } catch (err) {
    return next(err);
  }
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

  // Validaciones cruzadas sobre materias y correlativas
  const codigos = materias.map((m) => m.codigo);
  const setCodigos = new Set(codigos);
  if (setCodigos.size !== codigos.length) {
    return next(buildError("Hay códigos de materia duplicados en el payload", 400));
  }
  for (const m of materias) {
    for (const corr of m.correlativas || []) {
      if (!setCodigos.has(corr)) {
        return next(
          buildError(
            `La correlativa "${corr}" de la materia "${m.codigo}" no coincide con ninguna materia del plan`,
            400
          )
        );
      }
    }
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
      const oldIds = existentes.map((m) => m.id);

      // Upsert por código: actualizar las existentes, crear las nuevas
      const codigoToId = {};
      for (const m of materias) {
        const datos = {
          nombre: m.nombre,
          anio_cursada: m.anio_cursada,
          tipo: m.es_optativa ? "optativa" : "obligatoria",
          modalidad: m.modalidad,
          es_optativa: m.es_optativa,
          es_unahur: m.es_unahur,
          creditos_otorga: m.creditos_otorga,
        };
        const existente = existentesByCodigo.get(m.codigo);
        if (existente) {
          await existente.update(datos, { transaction: t });
          codigoToId[m.codigo] = existente.id;
        } else {
          const creada = await materia.create(
            { plan_id: id, codigo: m.codigo, ...datos },
            { transaction: t }
          );
          codigoToId[m.codigo] = creada.id;
        }
      }

      // Bajas: materias del plan cuyo código ya no está en el payload
      const removedIds = existentes
        .filter((m) => !setCodigos.has(m.codigo))
        .map((m) => m.id);

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
      for (const m of materias) {
        for (const corrCodigo of m.correlativas || []) {
          await correlatividad.create(
            {
              materia_id: codigoToId[m.codigo],
              materia_requisito_id: codigoToId[corrCodigo],
              tipo: "cursar",
            },
            { transaction: t }
          );
        }
      }
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

  const plan = await plan_estudio.findByPk(planId, {
    include: [{ model: materia, as: "materias", attributes: ["id", "codigo"] }],
  });

  if (!plan) {
    return next(buildError("Plan de estudio no encontrado", 404));
  }

  const { codigo, nombre, anio_cursada, modalidad, es_optativa, es_unahur, creditos_otorga, correlativas } = req.body;

  const existentes = plan.materias || [];
  if (existentes.some((m) => m.codigo === codigo)) {
    return next(buildError(`Ya existe una materia con el código "${codigo}" en este plan`, 400));
  }

  const codigosExistentes = new Set(existentes.map((m) => m.codigo));
  for (const corr of correlativas || []) {
    if (!codigosExistentes.has(corr)) {
      return next(
        buildError(
          `La correlativa "${corr}" no coincide con ninguna materia del plan`,
          400
        )
      );
    }
  }

  const creada = await materia.create({
    plan_id: planId,
    codigo,
    nombre,
    anio_cursada,
    tipo: es_optativa ? "optativa" : "obligatoria",
    modalidad,
    es_optativa,
    es_unahur,
    creditos_otorga,
  });

  if (Array.isArray(correlativas) && correlativas.length > 0) {
    const codigoToId = Object.fromEntries(
      existentes.map((m) => [m.codigo, m.id])
    );
    codigoToId[codigo] = creada.id;

    for (const corrCodigo of correlativas) {
      await correlatividad.create({
        materia_id: creada.id,
        materia_requisito_id: codigoToId[corrCodigo],
        tipo: "cursar",
      });
    }
  }

  const data = await obtenerPlanFormateado(planId);
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

  const plan = await plan_estudio.findByPk(planId, {
    include: [{ model: materia, as: "materias", attributes: ["id", "codigo"] }],
  });
  if (!plan) {
    return next(buildError("Plan de estudio no encontrado", 404));
  }

  const materiaExistente = await materia.findByPk(materiaId);
  if (!materiaExistente || materiaExistente.plan_id !== planId) {
    return next(buildError("Materia no encontrada en el plan", 404));
  }

  const { codigo, nombre, anio_cursada, modalidad, es_optativa, es_unahur, creditos_otorga, correlativas } = req.body;

  if (codigo !== undefined) {
    const existentes = plan.materias || [];
    const duplicado = existentes.find((m) => m.codigo === codigo && m.id !== materiaId);
    if (duplicado) {
      return next(buildError(`Ya existe otra materia con el código "${codigo}" en este plan`, 400));
    }
  }

  const datos = {};
  if (codigo !== undefined) datos.codigo = codigo;
  if (nombre !== undefined) datos.nombre = nombre;
  if (anio_cursada !== undefined) datos.anio_cursada = anio_cursada;
  if (modalidad !== undefined) datos.modalidad = modalidad;
  if (es_optativa !== undefined) {
    datos.es_optativa = es_optativa;
    datos.tipo = es_optativa ? "optativa" : "obligatoria";
  }
  if (es_unahur !== undefined) datos.es_unahur = es_unahur;
  if (creditos_otorga !== undefined) datos.creditos_otorga = creditos_otorga;

  await materiaExistente.update(datos);

  if (correlativas !== undefined) {
    const codigosExistentes = new Set((plan.materias || [])
      .filter((m) => m.id !== materiaId)
      .map((m) => m.codigo));

    if (codigo !== undefined) codigosExistentes.add(codigo);
    else codigosExistentes.add(materiaExistente.codigo);

    for (const corr of correlativas) {
      if (!codigosExistentes.has(corr)) {
        return next(
          buildError(
            `La correlativa "${corr}" no coincide con ninguna materia del plan`,
            400
          )
        );
      }
    }

    await correlatividad.destroy({ where: { materia_id: materiaId } });
    for (const corrCodigo of correlativas) {
      const requisito = (plan.materias || []).find((m) => m.codigo === corrCodigo);
      if (requisito) {
        await correlatividad.create({
          materia_id: materiaId,
          materia_requisito_id: requisito.id,
          tipo: "cursar",
        });
      }
    }
  }

  const data = await obtenerPlanFormateado(planId);
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

  const materiaExistente = await materia.findByPk(materiaId);
  if (!materiaExistente || materiaExistente.plan_id !== planId) {
    return next(buildError("Materia no encontrada en el plan", 404));
  }

  await correlatividad.destroy({
    where: {
      [Op.or]: [
        { materia_id: materiaId },
        { materia_requisito_id: materiaId },
      ],
    },
  });

  await materiaExistente.destroy();

  const data = await obtenerPlanFormateado(planId);
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
