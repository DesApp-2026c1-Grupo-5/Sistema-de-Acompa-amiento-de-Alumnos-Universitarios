const {
  sequelize,
  estudiante,
  materia,
  correlatividad,
  situacion_academica,
  estado_materia,
  final,
  post,
} = require("../db/models");
const {
  normalizarEstadoMateria,
  obtenerIncumplimientos,
} = require("./correlatividadAcademica.service");

const ACCIONES = {
  inscripcion: {
    estado: "cursando",
    eventType: "enrollment",
    contenido: (nombreMateria) => `Me inscribí a ${nombreMateria}`,
    pubFlag: "pub_inscripciones",
  },
  regularizacion: {
    estado: "regular",
    eventType: "regular",
    contenido: (nombreMateria) => `Regularicé ${nombreMateria}`,
    pubFlag: "pub_regularizaciones",
  },
  aprobacion: {
    estado: "aprobada",
    eventType: "approved",
    contenido: (nombreMateria) => `Aprobé ${nombreMateria}`,
    pubFlag: "pub_aprobaciones",
  },
};

const CONFIG_POR_ESTADO = Object.values(ACCIONES).reduce((acc, config) => {
  acc[config.estado] = config;
  return acc;
}, {});
const ESTADOS_VALIDOS = new Set(["pendiente", "cursando", "regular", "aprobada"]);
const RANGO_ESTADO = { pendiente: 0, cursando: 1, regular: 2, aprobada: 3 };

const buildError = (message, statusCode, code, details) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  if (details) error.details = details;
  return error;
};

const getEstudianteByUsuarioId = (usuarioId, transaction) =>
  estudiante.findOne({ where: { usuario_id: usuarioId }, transaction });

const getSituacionActiva = (estudianteId, transaction, lock = false) =>
  situacion_academica.findOne({
    where: { estudiante_id: estudianteId },
    order: [
      ["fecha_inicio", "DESC"],
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
    transaction,
    ...(lock ? { lock: transaction.LOCK.UPDATE } : {}),
  });

const normalizarFecha = (value) => {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const crearPostAcademico = async ({
  estudianteData,
  materiaData,
  config,
  transaction,
}) => {
  if (!estudianteData?.[config.pubFlag]) return null;

  return post.create(
    {
      estudiante_id: estudianteData.id,
      contenido: config.contenido(materiaData.nombre),
      event_type: config.eventType,
      event_subject: materiaData.nombre,
    },
    { transaction }
  );
};

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const fechasIguales = (actual, siguiente) =>
  new Date(actual || 0).getTime() === new Date(siguiente || 0).getTime();

const construirSiguienteEstado = (cambio, existente, cambioEstado) => {
  let fecha = existente?.fecha ?? null;
  if (hasOwn(cambio, "fecha")) {
    fecha = cambio.fecha ? normalizarFecha(cambio.fecha) : cambioEstado ? new Date() : null;
  } else if (cambioEstado) {
    fecha = new Date();
  }

  return {
    estado: cambio.estado,
    anio: hasOwn(cambio, "anio") ? cambio.anio : existente?.anio ?? null,
    cuatrimestre: hasOwn(cambio, "cuatrimestre")
      ? cambio.cuatrimestre
      : existente?.cuatrimestre ?? null,
    nota: hasOwn(cambio, "nota") ? cambio.nota : existente?.nota ?? null,
    fecha,
  };
};

const cargarContextoAcademico = async (usuarioId, transaction, lock = true) => {
  const estudianteData = await getEstudianteByUsuarioId(usuarioId, transaction);
  if (!estudianteData) {
    throw buildError("Estudiante no encontrado", 404, "ESTUDIANTE_NO_ENCONTRADO");
  }

  const situacion = await getSituacionActiva(estudianteData.id, transaction, lock);
  if (!situacion) {
    throw buildError(
      "Situacion academica no encontrada",
      404,
      "SITUACION_ACADEMICA_NO_ENCONTRADA"
    );
  }

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
      order: [["id", "ASC"]],
      transaction,
    }),
  ]);

  const estadosConFinalAprobado = new Set();
  if (estados.length > 0) {
    const finalesAprobados = await final.findAll({
      where: {
        estado_materia_id: estados.map((item) => item.id),
        aprobado: true,
      },
      attributes: ["estado_materia_id"],
      raw: true,
      transaction,
    });
    finalesAprobados.forEach((item) =>
      estadosConFinalAprobado.add(Number(item.estado_materia_id))
    );
  }

  return { estudianteData, situacion, materias, estados, estadosConFinalAprobado };
};

const prepararCambios = (contexto, cambios) => {
  if (!Array.isArray(cambios) || cambios.length === 0) {
    throw buildError("Debe indicar al menos una materia", 400, "LOTE_MATERIAS_VACIO");
  }

  const ids = cambios.map((cambio) => Number(cambio.materia_id));
  if (new Set(ids).size !== ids.length) {
    throw buildError(
      "No se puede actualizar una materia mas de una vez en el mismo lote",
      400,
      "LOTE_MATERIAS_DUPLICADAS"
    );
  }

  const materiaPorId = new Map(contexto.materias.map((item) => [Number(item.id), item]));
  const estadoExistentePorMateria = new Map(
    contexto.estados.map((item) => [Number(item.materia_id), item])
  );
  const estadoProyectado = new Map(
    contexto.materias.map((item) => [
      Number(item.id),
      normalizarEstadoMateria(estadoExistentePorMateria.get(Number(item.id))?.estado),
    ])
  );

  for (const cambio of cambios) {
    const materiaId = Number(cambio.materia_id);
    if (!materiaPorId.has(materiaId)) {
      throw buildError(
        "La materia no pertenece al plan de estudio activo",
        400,
        "MATERIA_FUERA_DEL_PLAN",
        { materia_id: materiaId }
      );
    }

    if (!ESTADOS_VALIDOS.has(cambio.estado)) {
      throw buildError("Estado de materia invalido", 400, "ESTADO_MATERIA_INVALIDO", {
        materia_id: materiaId,
        estado: cambio.estado,
      });
    }

    const estadoExistente = estadoExistentePorMateria.get(materiaId);
    if (
      cambio.estado !== "aprobada" &&
      estadoExistente &&
      contexto.estadosConFinalAprobado.has(Number(estadoExistente.id))
    ) {
      throw buildError(
        "No se puede bajar el estado mientras exista un final aprobado",
        409,
        "FINAL_APROBADO_VIGENTE",
        { materia_id: materiaId }
      );
    }

    estadoProyectado.set(materiaId, cambio.estado);
  }

  const incumplimientos = obtenerIncumplimientos(contexto.materias, estadoProyectado);
  if (incumplimientos.length > 0) {
    throw buildError(
      "El cambio deja materias con correlatividades incumplidas",
      409,
      "CORRELATIVIDADES_INCUMPLIDAS",
      { violations: incumplimientos }
    );
  }

  return { materiaPorId, estadoExistentePorMateria };
};

const aplicarCambios = async (usuarioId, cambios, transaction, soloValidar = false) => {
  const contexto = await cargarContextoAcademico(usuarioId, transaction, !soloValidar);
  const { materiaPorId, estadoExistentePorMateria } = prepararCambios(contexto, cambios);
  if (soloValidar) return [];

  const results = [];

  for (const cambio of cambios) {
    const materiaId = Number(cambio.materia_id);
    const materiaData = materiaPorId.get(materiaId);
    const existente = estadoExistentePorMateria.get(materiaId);
    const estadoAnterior = normalizarEstadoMateria(existente?.estado);
    const cambioEstado = estadoAnterior !== cambio.estado;
    const nextData = construirSiguienteEstado(cambio, existente, cambioEstado);
    const hasChanges =
      !existente ||
      existente.estado !== nextData.estado ||
      existente.anio !== nextData.anio ||
      existente.cuatrimestre !== nextData.cuatrimestre ||
      existente.nota !== nextData.nota ||
      !fechasIguales(existente.fecha, nextData.fecha);

    let estadoMateriaData = existente;
    if (!existente) {
      estadoMateriaData = await estado_materia.create(
        {
          situacion_id: contexto.situacion.id,
          materia_id: materiaId,
          ...nextData,
        },
        { transaction }
      );
    } else if (hasChanges) {
      await existente.update(nextData, { transaction });
    }

    let postData = null;
    const config = CONFIG_POR_ESTADO[cambio.estado];
    if (
      cambioEstado &&
      RANGO_ESTADO[cambio.estado] > RANGO_ESTADO[estadoAnterior] &&
      config
    ) {
      postData = await crearPostAcademico({
        estudianteData: contexto.estudianteData,
        materiaData,
        config,
        transaction,
      });
    }

    results.push({
      materia_id: materiaId,
      success: true,
      tipo: "materia",
      data: {
        estado_materia: estadoMateriaData.get({ plain: true }),
        publicacion: postData ? postData.get({ plain: true }) : null,
      },
    });
  }

  return results;
};

const ejecutarConTransaccion = (transaction, callback) =>
  transaction ? callback(transaction) : sequelize.transaction(callback);

const actualizarEstadosMaterias = (usuarioId, cambios, options = {}) =>
  ejecutarConTransaccion(options.transaction, (transaction) =>
    aplicarCambios(usuarioId, cambios, transaction, false)
  );

const validarEstadosMaterias = (usuarioId, cambios, options = {}) =>
  ejecutarConTransaccion(options.transaction, (transaction) =>
    aplicarCambios(usuarioId, cambios, transaction, true)
  );

const registrarAccionAcademica = async (usuarioId, materiaId, accion, payload = {}) => {
  const config = ACCIONES[accion];
  if (!config) {
    throw buildError("Accion academica invalida", 400, "ACCION_ACADEMICA_INVALIDA");
  }

  const [result] = await actualizarEstadosMaterias(usuarioId, [
    { materia_id: materiaId, estado: config.estado, ...payload },
  ]);
  return result.data;
};

module.exports = {
  actualizarEstadosMaterias,
  registrarAccionAcademica,
  validarEstadosMaterias,
};
