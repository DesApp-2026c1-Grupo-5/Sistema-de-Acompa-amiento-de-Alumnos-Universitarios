const Joi = require("joi");

const crearPlanSchema = Joi.object({
  anio: Joi.number().integer().min(1900).max(2100).required(),
  estado: Joi.string()
    .valid("vigente", "transicion", "discontinuado")
    .default("vigente"),
  creditos_requeridos: Joi.number().integer().min(0).max(500).required(),
  niveles_ingles_requeridos: Joi.number().integer().min(0).max(10).required(),
  materias: Joi.array().items(materiaSchema).optional(),
});

const actualizarPlanSchema = Joi.object({
  estado: Joi.string()
    .valid("vigente", "transicion", "discontinuado")
    .required(),
});

const materiaSchema = Joi.object({
  codigo: Joi.string().required(),
  nombre: Joi.string().required(),
  anio_cursada: Joi.number().integer().min(1).max(10).required(),
  modalidad: Joi.string().allow("").default(""),
  es_optativa: Joi.boolean().default(false),
  es_unahur: Joi.boolean().default(false),
  creditos_otorga: Joi.number().integer().min(0).required(),
  correlativas: Joi.array().items(Joi.string()).default([]),
});

const actualizarPlanCompletoSchema = Joi.object({
  estado: Joi.string()
    .valid("vigente", "transicion", "discontinuado")
    .required(),
  creditos_requeridos: Joi.number().integer().min(0).max(500).required(),
  niveles_ingles_requeridos: Joi.number().integer().min(0).max(10).required(),
  materias_unahur: Joi.number().integer().min(0).required(),
  materias: Joi.array().items(materiaSchema).default([]),
});

const agregarMateriaSchema = Joi.object({
  codigo: Joi.string().required(),
  nombre: Joi.string().required(),
  anio_cursada: Joi.number().integer().min(1).max(10).required(),
  modalidad: Joi.string().allow("").default(""),
  es_optativa: Joi.boolean().default(false),
  es_unahur: Joi.boolean().default(false),
  creditos_otorga: Joi.number().integer().min(0).required(),
  correlativas: Joi.array().items(Joi.string()).default([]),
});

const actualizarMateriaSchema = Joi.object({
  codigo: Joi.string().optional(),
  nombre: Joi.string().optional(),
  anio_cursada: Joi.number().integer().min(1).max(10).optional(),
  modalidad: Joi.string().allow("").optional(),
  es_optativa: Joi.boolean().optional(),
  es_unahur: Joi.boolean().optional(),
  creditos_otorga: Joi.number().integer().min(0).optional(),
  correlativas: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  crearPlanSchema,
  actualizarPlanSchema,
  actualizarPlanCompletoSchema,
  agregarMateriaSchema,
  actualizarMateriaSchema,
};
