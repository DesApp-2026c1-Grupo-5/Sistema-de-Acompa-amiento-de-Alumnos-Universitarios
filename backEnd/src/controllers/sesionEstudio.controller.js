const { Op } = require("sequelize");
const {
  sesion_estudio,
  estudiante,
  materia,
  inscripcion_sesion,
} = require("../db/models");

const crearSesion = async (req, res, next) => {
  try {
    const {
      materia_id,
      tema,
      tipo,
      link_ubicacion,
      fecha_hora,
      duracion_minutos,
      cupos_max,
      descripcion,
      requiere_aprobacion,
    } = req.body;

    if (!materia_id || !tema || !tipo || !fecha_hora || !duracion_minutos) {
      const error = new Error("materia_id, tema, tipo, fecha_hora y duracion_minutos son obligatorios");
      error.statusCode = 400;
      throw error;
    }

    const estudianteData = await estudiante.findOne({
      where: { usuario_id: req.user.sub },
    });

    if (!estudianteData) {
      const error = new Error("Estudiante no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const materiaData = await materia.findByPk(materia_id);

    if (!materiaData) {
      const error = new Error("Materia no encontrada");
      error.statusCode = 404;
      throw error;
    }

    const sesion = await sesion_estudio.create({
      materia_id,
      creador_id: estudianteData.id,
      tema,
      tipo,
      link_ubicacion,
      fecha_hora,
      duracion_minutos,
      cupos_max: cupos_max || null,
      descripcion,
      requiere_aprobacion: Boolean(requiere_aprobacion),
      cancelada: false,
    });

    return res.status(201).json({
      ok: true,
      data: sesion,
    });
  } catch (error) {
    return next(error);
  }
};

const listarSesiones = async (req, res, next) => {
  try {
    const { materia_id, tipo, desde, hasta, solo_disponibles = "true" } = req.query;

    const where = {};

    if (materia_id) {
      where.materia_id = materia_id;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (solo_disponibles === "true") {
      where.cancelada = false;
    }

    if (desde || hasta) {
      where.fecha_hora = {};
      if (desde) where.fecha_hora[Op.gte] = new Date(desde);
      if (hasta) where.fecha_hora[Op.lte] = new Date(hasta);
    }

    const sesiones = await sesion_estudio.findAll({
      where,
      include: [
        {
          model: estudiante,
          as: "creador",
          attributes: ["id", "nombre", "apellido"],
        },
        {
          model: materia,
          attributes: ["id", "nombre", "anio_cursada"],
        },
        {
          model: inscripcion_sesion,
          attributes: ["id", "estado", "estudiante_id"],
        },
      ],
      order: [["fecha_hora", "ASC"]],
    });

    const data = sesiones.map((sesion) => {
      const plain = sesion.get({ plain: true });
      const cantidad_inscriptos = plain.inscripcion_sesions.length;
      return {
        ...plain,
        cantidad_inscriptos,
      };
    });

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  crearSesion,
  listarSesiones,
};
