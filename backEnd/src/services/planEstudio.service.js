const db = require("../db/models");

const {
  sequelize,
  carrera,
  plan_estudio,
  materia,
  correlatividad,
  estado_materia,
  Sequelize,
} = db;
const {
  repararSituacionesAcademicas,
} = require("./saneamientoAcademico.service");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizarCodigo = (codigo) => (codigo || "").trim();

const normalizarCorrelativas = (correlativas = [], materiaCodigo = null) => {
  const normalizadas = correlativas.map((correlativa) => {
    if (typeof correlativa === "string") {
      return { codigo: normalizarCodigo(correlativa), tipo: "cursar" };
    }

    const codigo = normalizarCodigo(correlativa?.codigo);
    const tipo = correlativa?.tipo;
    if (tipo !== "cursar" && tipo !== "aprobar") {
      throw buildError(`Tipo de correlativa inválido para "${codigo}"`, 400);
    }
    return { codigo, tipo };
  }).filter((correlativa) => correlativa.codigo);

  const codigos = normalizadas.map((correlativa) => correlativa.codigo);
  const duplicado = codigos.find((codigo, index) => codigos.indexOf(codigo) !== index);
  if (duplicado) {
    const contexto = materiaCodigo ? ` en la materia "${materiaCodigo}"` : "";
    throw buildError(`La correlativa "${duplicado}" está duplicada${contexto}`, 400);
  }

  return normalizadas;
};

const validarMateriasPayload = (materias = []) => {
  const codigos = materias.map((m) => normalizarCodigo(m.codigo));
  const setCodigos = new Set(codigos);
  if (setCodigos.size !== codigos.length) {
    throw buildError("Hay códigos de materia duplicados en el payload", 400);
  }
  const ids = materias.map((m) => m.id).filter(Boolean).map(Number);
  if (new Set(ids).size !== ids.length) {
    throw buildError("Hay materias duplicadas en el payload", 400);
  }

  const normalizadas = materias.map((m, index) => ({
    ...m,
    codigo: codigos[index],
    correlativas: normalizarCorrelativas(m.correlativas || [], codigos[index]),
  }));

  for (const m of normalizadas) {
    for (const correlativa of m.correlativas) {
      if (correlativa.codigo === m.codigo) {
        throw buildError("Una materia no puede ser correlativa de sí misma", 400);
      }
      if (!setCodigos.has(correlativa.codigo)) {
        throw buildError(
          `La correlativa "${correlativa.codigo}" de la materia "${m.codigo}" no coincide con ninguna materia del plan`,
          400
        );
      }
    }
  }

  const graph = new Map(
    normalizadas.map((m) => [m.codigo, m.correlativas.map((c) => c.codigo)])
  );
  const estado = new Map();
  const visitar = (codigo) => {
    if (estado.get(codigo) === 1) {
      throw buildError(`Las correlativas forman un ciclo que incluye "${codigo}"`, 400);
    }
    if (estado.get(codigo) === 2) return;

    estado.set(codigo, 1);
    for (const requisito of graph.get(codigo) || []) visitar(requisito);
    estado.set(codigo, 2);
  };

  for (const codigo of codigos) visitar(codigo);
  return normalizadas;
};

const getMateriaInclude = () => [
  {
    model: correlatividad,
    as: "correlatividades",
    attributes: ["id", "materia_requisito_id", "tipo"],
    include: [
      {
        model: materia,
        as: "requisito",
        attributes: ["id", "codigo"],
      },
    ],
  },
];

const formatMateria = (m) => ({
  id: m.id,
  codigo: m.codigo,
  nombre: m.nombre,
  anio_cursada: m.anio_cursada,
  modalidad: m.modalidad,
  es_optativa: !!m.es_optativa,
  es_unahur: !!m.es_unahur,
  creditos_otorga: m.creditos_otorga ?? 0,
  correlativas: (m.correlatividades || [])
    .map((c) =>
      c.requisito?.codigo
        ? { codigo: c.requisito.codigo, tipo: c.tipo || "cursar" }
        : null
    )
    .filter(Boolean),
});

const getPlanById = async (id) => {
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
        include: getMateriaInclude(),
      },
    ],
    order: [
      [{ model: materia, as: "materias" }, "anio_cursada", "ASC"],
      [{ model: materia, as: "materias" }, "codigo", "ASC"],
    ],
  });

  if (!plan) {
    throw buildError("Plan de estudio no encontrado", 404);
  }

  const plain = plan.get({ plain: true });
  const materias = (plain.materias || []).map(formatMateria);

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
    materias,
  };
};

const crearPlan = async (carreraId, payload) => {
  const existente = await carrera.findByPk(carreraId);
  if (!existente) {
    throw buildError("Carrera no encontrada", 404);
  }

  const nuevoPlan = await plan_estudio.create({
    carrera_id: carreraId,
    nombre: `${existente.nombre} ${payload.anio}`,
    anio: payload.anio,
    estado: payload.estado || "vigente",
    creditos_requeridos: payload.creditos_requeridos,
    niveles_ingles_requeridos: payload.niveles_ingles_requeridos,
  });

  return {
    id: nuevoPlan.id,
    anio: nuevoPlan.anio,
    estado: nuevoPlan.estado,
    creditos_requeridos: nuevoPlan.creditos_requeridos,
    niveles_ingles_requeridos: nuevoPlan.niveles_ingles_requeridos,
    carrera_id: nuevoPlan.carrera_id,
  };
};

const actualizarPlan = async (id, payload) => {
  const existente = await plan_estudio.findByPk(id);
  if (!existente) {
    throw buildError("Plan de estudio no encontrado", 404);
  }

  await existente.update({
    estado: payload.estado ?? existente.estado,
    creditos_requeridos:
      payload.creditos_requeridos ?? existente.creditos_requeridos,
    niveles_ingles_requeridos:
      payload.niveles_ingles_requeridos ?? existente.niveles_ingles_requeridos,
  });

  return {
    id: existente.id,
    anio: existente.anio,
    estado: existente.estado,
    creditos_requeridos: existente.creditos_requeridos,
    niveles_ingles_requeridos: existente.niveles_ingles_requeridos,
  };
};

const getPlanMateriaContext = async (planId, materiaId, transaction) => {
  const plan = await plan_estudio.findByPk(planId, { transaction });
  if (!plan) {
    throw buildError("Plan de estudio no encontrado", 404);
  }

  const materiaExistente = await materia.findOne({
    where: { id: materiaId, plan_id: planId },
    include: getMateriaInclude(),
    transaction,
  });

  if (!materiaExistente) {
    throw buildError("Materia no encontrada en el plan", 404);
  }

  return { plan, materiaExistente };
};

const assertCodigoDisponible = async (planId, codigo, excludeMateriaId = null, transaction) => {
  const existente = await materia.findOne({
    where: {
      plan_id: planId,
      codigo,
      ...(excludeMateriaId ? { id: { [Sequelize.Op.ne]: excludeMateriaId } } : {}),
    },
    transaction,
  });

  if (existente) {
    throw buildError(`Ya existe una materia con el código "${codigo}" en este plan`, 409);
  }
};

const resolveCorrelativas = async (planId, materiaId, correlativas, transaction) => {
  const normalizadas = normalizarCorrelativas(correlativas);
  const codigos = normalizadas.map((correlativa) => correlativa.codigo);
  if (normalizadas.length === 0) {
    return [];
  }

  const materiaActual = await materia.findByPk(materiaId, {
    attributes: ["codigo"],
    transaction,
  });
  if (materiaActual && codigos.includes(materiaActual.codigo)) {
    throw buildError("Una materia no puede ser correlativa de sí misma", 400);
  }

  const materiasReferenciadas = await materia.findAll({
    where: { plan_id: planId, codigo: { [Sequelize.Op.in]: codigos } },
    attributes: ["id", "codigo"],
    transaction,
  });

  if (materiasReferenciadas.length !== codigos.length) {
    const found = new Set(materiasReferenciadas.map((m) => m.codigo));
    const missing = codigos.find((codigo) => !found.has(codigo));
    throw buildError(`La correlativa "${missing}" no existe en este plan`, 400);
  }

  const idsByCodigo = new Map(materiasReferenciadas.map((m) => [m.codigo, m.id]));
  return normalizadas.map((correlativa) => ({
    materiaRequisitoId: idsByCodigo.get(correlativa.codigo),
    tipo: correlativa.tipo,
  }));
};

const syncCorrelatividades = async (transaction, materiaId, correlativas) => {
  await correlatividad.destroy({ where: { materia_id: materiaId }, transaction });

  if (correlativas.length === 0) {
    return;
  }

  await correlatividad.bulkCreate(
    correlativas.map(({ materiaRequisitoId, tipo }) => ({
      materia_id: materiaId,
      materia_requisito_id: materiaRequisitoId,
      tipo,
    })),
    { transaction }
  );
};

const assertPlanSinCiclos = async (planId, materiaId, correlativas, transaction) => {
  const materiasPlan = await materia.findAll({
    where: { plan_id: planId },
    attributes: ["id"],
    transaction,
    raw: true,
  });
  const idsPlan = new Set(materiasPlan.map((item) => Number(item.id)));
  const relaciones = await correlatividad.findAll({
    where: { materia_id: { [Sequelize.Op.in]: [...idsPlan] } },
    attributes: ["materia_id", "materia_requisito_id"],
    transaction,
    raw: true,
  });
  const graph = new Map([...idsPlan].map((id) => [id, []]));

  for (const relacion of relaciones) {
    if (Number(relacion.materia_id) === Number(materiaId)) continue;
    graph.get(Number(relacion.materia_id))?.push(Number(relacion.materia_requisito_id));
  }
  graph.set(
    Number(materiaId),
    correlativas.map((item) => Number(item.materiaRequisitoId))
  );

  const estado = new Map();
  const visitar = (id) => {
    if (estado.get(id) === 1) {
      throw buildError("Las correlativas no pueden formar ciclos", 400);
    }
    if (estado.get(id) === 2) return;
    estado.set(id, 1);
    for (const requisitoId of graph.get(id) || []) visitar(requisitoId);
    estado.set(id, 2);
  };
  for (const id of idsPlan) visitar(id);
};

const agregarMateria = async (planId, payload) => {
  return sequelize.transaction(async (transaction) => {
    const plan = await plan_estudio.findByPk(planId, { transaction });
    if (!plan) {
      throw buildError("Plan de estudio no encontrado", 404);
    }

    const codigo = normalizarCodigo(payload.codigo);
    await assertCodigoDisponible(planId, codigo, null, transaction);

    const nuevaMateria = await materia.create(
      {
        plan_id: planId,
        codigo,
        nombre: payload.nombre.trim(),
        anio_cursada: payload.anio_cursada,
        modalidad: payload.modalidad,
        tipo: payload.es_optativa ? "optativa" : "obligatoria",
        es_optativa: !!payload.es_optativa,
        es_unahur: !!payload.es_unahur,
        creditos_otorga: payload.creditos_otorga,
      },
      { transaction }
    );

    const correlativas = await resolveCorrelativas(
      planId,
      nuevaMateria.id,
      payload.correlativas || [],
      transaction
    );
    await assertPlanSinCiclos(planId, nuevaMateria.id, correlativas, transaction);
    await syncCorrelatividades(transaction, nuevaMateria.id, correlativas);

    const materiaCompleta = await materia.findByPk(nuevaMateria.id, {
      include: getMateriaInclude(),
      transaction,
    });

    if (!materiaCompleta) {
      throw buildError("No se pudo crear la materia", 500);
    }

    return formatMateria(materiaCompleta.get({ plain: true }));
  });
};

const actualizarMateria = async (planId, materiaId, payload) => {
  const result = await sequelize.transaction(async (transaction) => {
    const { materiaExistente } = await getPlanMateriaContext(planId, materiaId, transaction);

    const nextCodigo = payload.codigo != null ? normalizarCodigo(payload.codigo) : materiaExistente.codigo;
    if (nextCodigo !== materiaExistente.codigo) {
      await assertCodigoDisponible(planId, nextCodigo, materiaId, transaction);
    }

    await materiaExistente.update(
      {
        codigo: nextCodigo,
        nombre: payload.nombre != null ? payload.nombre.trim() : materiaExistente.nombre,
        anio_cursada: payload.anio_cursada ?? materiaExistente.anio_cursada,
        modalidad: payload.modalidad ?? materiaExistente.modalidad,
        tipo:
          payload.es_optativa == null
            ? materiaExistente.tipo
            : payload.es_optativa
              ? "optativa"
              : "obligatoria",
        es_optativa: payload.es_optativa ?? materiaExistente.es_optativa,
        es_unahur: payload.es_unahur ?? materiaExistente.es_unahur,
        creditos_otorga: payload.creditos_otorga ?? materiaExistente.creditos_otorga,
      },
      { transaction }
    );

    if (payload.correlativas) {
      const correlativas = await resolveCorrelativas(
        planId,
        materiaId,
        payload.correlativas,
        transaction
      );
      await assertPlanSinCiclos(planId, materiaId, correlativas, transaction);
      await syncCorrelatividades(transaction, materiaId, correlativas);
      await repararSituacionesAcademicas({
        planId: Number(planId),
        transaction,
      });
    }

    const updated = await materia.findByPk(materiaId, {
      include: getMateriaInclude(),
      transaction,
    });

    if (!updated) {
      throw buildError("No se pudo actualizar la materia", 500);
    }

    return formatMateria(updated.get({ plain: true }));
  });

  return result;
};

const eliminarMateria = async (planId, materiaId) => {
  return sequelize.transaction(async (transaction) => {
    const { materiaExistente } = await getPlanMateriaContext(planId, materiaId, transaction);

    const estadosAsociados = await estado_materia.count({
      where: { materia_id: materiaId },
      transaction,
    });
    if (estadosAsociados > 0) {
      throw buildError(
        "No se puede eliminar una materia con trayectoria académica asociada",
        409
      );
    }

    await correlatividad.destroy({
      where: {
        [Sequelize.Op.or]: [
          { materia_id: materiaId },
          { materia_requisito_id: materiaId },
        ],
      },
      transaction,
    });

    await materiaExistente.destroy({ transaction });

    return { id: materiaId };
  });
};

module.exports = {
  validarMateriasPayload,
  getPlanById,
  crearPlan,
  actualizarPlan,
  agregarMateria,
  actualizarMateria,
  eliminarMateria,
};
