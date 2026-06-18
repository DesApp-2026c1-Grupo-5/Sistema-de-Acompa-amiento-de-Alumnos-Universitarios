const Joi = require("joi");

const crearSituacionSchema = Joi.object({
  plan_id: Joi.number().integer().positive().required(),
});

const actualizarMateriasSchema = Joi.object({
  materias: Joi.array()
    .items(
      Joi.object({
        materia_id: Joi.number().integer().positive().required(),
        estado: Joi.string()
          .valid("pendiente", "cursando", "regular", "aprobada")
          .required(),
        anio: Joi.number().integer().positive().allow(null),
        cuatrimestre: Joi.number().integer().min(1).max(2).allow(null),
        nota: Joi.number().min(0).max(10).allow(null),
        fecha: Joi.date().allow(null),
      })
    )
    .min(1)
    .required(),
});

const crearFinalSchema = Joi.object({
  estado_materia_id: Joi.number().integer().positive().required(),
  fecha: Joi.date().required(),
  nota: Joi.number().min(0).max(10).required(),
  aprobado: Joi.boolean().required(),
});

const crearActividadSchema = Joi.object({
  descripcion: Joi.string().max(255).required(),
  creditos: Joi.number().integer().min(1).required(),
  fecha: Joi.date().required(),
  estado: Joi.string().valid("pendiente", "aprobada").optional(),
});

const actualizarFinalSchema = Joi.object({
  fecha: Joi.date().optional(),
  nota: Joi.number().min(0).max(10).optional(),
}).min(1);

module.exports = {
  crearSituacionSchema,
  actualizarMateriasSchema,
  crearFinalSchema,
  crearActividadSchema,
  actualizarFinalSchema,
};
