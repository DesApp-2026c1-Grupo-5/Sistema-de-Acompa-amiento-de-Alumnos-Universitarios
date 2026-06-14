const Joi = require("joi");

const materiaSchema = Joi.object({
  codigo: Joi.string().trim().max(20).required(),
  nombre: Joi.string().trim().max(200).required(),
  anio_cursada: Joi.number().integer().min(1).max(10).required(),
  modalidad: Joi.string().valid("Cuatrimestral", "Anual").required(),
  es_optativa: Joi.boolean().default(false),
  es_unahur: Joi.boolean().default(false),
  creditos_otorga: Joi.number().integer().min(0).max(50).required(),
  correlativas: Joi.array().items(Joi.string().trim().max(20)).default([]),
});

const planSchema = Joi.object({
  anio: Joi.number().integer().min(1900).max(2100).required(),
  estado: Joi.string().valid("vigente", "transicion", "discontinuado").default("vigente"),
  creditos_requeridos: Joi.number().integer().min(0).max(500).required(),
  niveles_ingles_requeridos: Joi.number().integer().min(0).max(10).required(),
});

const crearCarreraSchema = Joi.object({
  nombre: Joi.string().trim().max(200).required(),
  titulo: Joi.string().trim().max(200).required(),
  instituto: Joi.string().trim().max(200).required(),
  duracion_anios: Joi.number().integer().min(1).max(10).required(),
  plan: planSchema.optional(),
  materias: Joi.array().items(materiaSchema).optional(),
});

const actualizarCarreraSchema = Joi.object({
  nombre: Joi.string().trim().max(200).optional(),
  titulo: Joi.string().trim().max(200).optional(),
  instituto: Joi.string().trim().max(200).optional(),
  duracion_anios: Joi.number().integer().min(1).max(10).optional(),
});

module.exports = {
  crearCarreraSchema,
  actualizarCarreraSchema,
};
