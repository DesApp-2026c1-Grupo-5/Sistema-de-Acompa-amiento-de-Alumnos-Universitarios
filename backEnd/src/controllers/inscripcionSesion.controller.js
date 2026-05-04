const {
  inscripcion_sesion,
  sesion_estudio,
  estudiante,
} = require("../db/models");

const inscribirse = async (req, res, next) => {
  const { sesion_id } = req.body;

  const estudianteData = await estudiante.findOne({
    where: { usuario_id: req.user.sub },
  });

  if (!estudianteData) {
    const error = new Error("Estudiante no encontrado");
    error.statusCode = 404;
    return next(error);
  }

  const sesion = await sesion_estudio.findByPk(sesion_id);

  if (!sesion) {
    const error = new Error("Sesion no encontrada");
    error.statusCode = 404;
    return next(error);
  }

  if (sesion.cancelada) {
    const error = new Error("La sesion esta cancelada");
    error.statusCode = 400;
    return next(error);
  }

  const yaInscripto = await inscripcion_sesion.findOne({
    where: {
      sesion_id,
      estudiante_id: estudianteData.id,
    },
  });

  if (yaInscripto) {
    const error = new Error("Ya estas inscripto");
    error.statusCode = 400;
    return next(error);
  }

  const cantidadInscriptos = await inscripcion_sesion.count({
    where: { sesion_id },
  });

  if (
    sesion.cupos_max &&
    cantidadInscriptos >= sesion.cupos_max
  ) {
    const error = new Error("No hay cupos disponibles");
    error.statusCode = 400;
    return next(error);
  }

  const inscripcion = await inscripcion_sesion.create({
    sesion_id,
    estudiante_id: estudianteData.id,
    estado: "inscripto",
    fecha_inscripcion: new Date(),
    notificado_recordatorio: false,
  });

  return res.status(201).json({
    ok: true,
    data: inscripcion,
  });
};

module.exports = {
  inscribirse,
};