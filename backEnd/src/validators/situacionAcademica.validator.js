const Joi = require("joi");

const crearSituacionSchema = Joi.object({
  plan_id: Joi.number().integer().positive().required(),
});

const materiaEstadoSchema = Joi.object({
  materia_id: Joi.number().integer().positive().required(),
  estado: Joi.string()
    .valid("pendiente", "cursando", "regular", "aprobada")
    .required(),
  anio: Joi.number().integer().positive().allow(null),
  cuatrimestre: Joi.number().integer().min(1).max(2).allow(null),
  nota: Joi.number().min(0).max(10).allow(null),
  fecha: Joi.date().allow(null),
});

const materiasSinDuplicados = (value, helpers) => {
  const ids = value.map((item) => item.materia_id);
  return new Set(ids).size === ids.length
    ? value
    : helpers.error("array.unique", { pos: 0, value: "materia_id" });
};

const actualizarMateriasSchema = Joi.object({
  materias: Joi.array()
    .items(materiaEstadoSchema)
    .min(1)
    .custom(materiasSinDuplicados)
    .required(),
});

const crearFinalSchema = Joi.object({
  estado_materia_id: Joi.number().integer().positive().required(),
  fecha: Joi.date().required(),
  nota: Joi.number().min(0).max(10).required(),
  aprobado: Joi.boolean().optional(),
});

const crearActividadSchema = Joi.object({
  descripcion: Joi.string().max(255).required(),
  creditos: Joi.number().integer().min(1).required(),
  fecha: Joi.date().required(),
  estado: Joi.string().valid("pendiente", "aprobada").optional(),
});

const actualizarActividadSchema = Joi.object({
  estado: Joi.string().valid("pendiente", "aprobada").required(),
});

const actualizarFinalSchema = Joi.object({
  fecha: Joi.date().optional(),
  nota: Joi.number().min(0).max(10).optional(),
}).min(1);

const finalIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const confirmarImportacionSchema = Joi.object({
  materias: Joi.array()
    .items(materiaEstadoSchema)
    .custom(materiasSinDuplicados)
    .default([]),
  credit_activities: Joi.array()
    .items(
      Joi.object({
        descripcion: Joi.string().trim().max(255).required(),
        creditos: Joi.number().integer().min(1).required(),
      })
    )
    .default([]),
}).custom((value, helpers) =>
  value.materias.length || value.credit_activities.length
    ? value
    : helpers.error("object.min", { limit: 1 })
);

module.exports = {
  crearSituacionSchema,
  actualizarMateriasSchema,
  crearFinalSchema,
  crearActividadSchema,
  actualizarActividadSchema,
  actualizarFinalSchema,
  confirmarImportacionSchema,
  finalIdParamSchema,
};
