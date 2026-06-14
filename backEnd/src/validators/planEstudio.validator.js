const Joi = require("joi");

const crearPlanSchema = Joi.object({
  anio: Joi.number().integer().min(1900).max(2100).required(),
  estado: Joi.string()
    .valid("vigente", "transicion", "discontinuado")
    .default("vigente"),
  creditos_requeridos: Joi.number().integer().min(0).max(500).required(),
  niveles_ingles_requeridos: Joi.number().integer().min(0).max(10).required(),
});

const actualizarPlanSchema = Joi.object({
  estado: Joi.string()
    .valid("vigente", "transicion", "discontinuado")
    .required(),
});

module.exports = {
  crearPlanSchema,
  actualizarPlanSchema,
};
