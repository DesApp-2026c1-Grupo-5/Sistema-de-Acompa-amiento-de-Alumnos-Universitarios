const db = require("../db/models");
const { carrera, plan_estudio, materia, correlatividad, sequelize } = db;

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const listarCarreras = async (req, res) => {
  const carreras = await carrera.findAll({
    include: [
      {
        model: plan_estudio,
        as: "planes",
        attributes: ["id", "anio", "estado"],
      },
    ],
    order: [["nombre", "ASC"]],
  });

  const data = carreras.map((c) => {
    const plain = c.get({ plain: true });
    const planes = (plain.planes || []).map((p) => ({
      id: p.id,
      anio: p.anio,
      estado: p.estado,
    }));
    return {
      id: plain.id,
      nombre: plain.nombre,
      titulo: plain.titulo,
      instituto: plain.instituto,
      duracion_anios: plain.duracion_anios,
      planes,
    };
  });

  return res.status(200).json({ ok: true, data });
};

const crearCarrera = async (req, res, next) => {
  const { nombre, titulo, instituto, duracion_anios, plan, materias } = req.body;

  // Validaciones cruzadas sobre materias y correlativas
  if (Array.isArray(materias)) {
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
    if (materias.length > 0 && !plan) {
      return next(buildError("Se enviaron materias pero falta el plan de estudio", 400));
    }
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      const nuevaCarrera = await carrera.create(
        { nombre, titulo, instituto, duracion_anios },
        { transaction: t }
      );

      let nuevoPlan = null;
      const materiasCreadas = [];

      if (plan) {
        nuevoPlan = await plan_estudio.create(
          {
            carrera_id: nuevaCarrera.id,
            nombre: `${nombre} ${plan.anio}`,
            anio: plan.anio,
            estado: plan.estado || "vigente",
            creditos_requeridos: plan.creditos_requeridos,
            niveles_ingles_requeridos: plan.niveles_ingles_requeridos,
          },
          { transaction: t }
        );

        if (Array.isArray(materias) && materias.length > 0) {
          for (const m of materias) {
            const nuevaMateria = await materia.create(
              {
                plan_id: nuevoPlan.id,
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
            materiasCreadas.push({ codigo: m.codigo, id: nuevaMateria.id });
          }

          const codigoToId = Object.fromEntries(
            materiasCreadas.map((m) => [m.codigo, m.id])
          );

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
      }

      return { nuevaCarrera, nuevoPlan };
    });

    return res.status(201).json({
      ok: true,
      data: {
        id: result.nuevaCarrera.id,
        nombre: result.nuevaCarrera.nombre,
        titulo: result.nuevaCarrera.titulo,
        instituto: result.nuevaCarrera.instituto,
        duracion_anios: result.nuevaCarrera.duracion_anios,
        planes: result.nuevoPlan
          ? [
              {
                id: result.nuevoPlan.id,
                anio: result.nuevoPlan.anio,
                estado: result.nuevoPlan.estado,
              },
            ]
          : [],
      },
    });
  } catch (err) {
    return next(err);
  }
};

const actualizarCarrera = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(buildError("id de carrera inválido", 400));
  }

  const { nombre, titulo, instituto, duracion_anios } = req.body;

  try {
    const existente = await carrera.findByPk(id);
    if (!existente) {
      return next(buildError("Carrera no encontrada", 404));
    }

    await existente.update({
      nombre: nombre ?? existente.nombre,
      titulo: titulo ?? existente.titulo,
      instituto: instituto ?? existente.instituto,
      duracion_anios: duracion_anios ?? existente.duracion_anios,
    });

    return res.status(200).json({
      ok: true,
      data: {
        id: existente.id,
        nombre: existente.nombre,
        titulo: existente.titulo,
        instituto: existente.instituto,
        duracion_anios: existente.duracion_anios,
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listarCarreras,
  crearCarrera,
  actualizarCarrera,
};
