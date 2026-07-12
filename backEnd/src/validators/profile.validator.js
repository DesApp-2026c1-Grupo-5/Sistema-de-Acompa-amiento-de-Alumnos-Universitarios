const Joi = require("joi");

const actualizarPerfilSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(100).optional(),
  apellido: Joi.string().trim().min(2).max(100).optional(),
  bio: Joi.string().trim().max(500).allow("", null).optional(),
  career: Joi.string().trim().max(255).allow("", null).optional(),
  pub_inscripciones: Joi.boolean().optional(),
  pub_regularizaciones: Joi.boolean().optional(),
  pub_aprobaciones: Joi.boolean().optional(),
  email_visible: Joi.boolean().optional(),
}).min(1);

const actualizarPrivacidadSchema = Joi.object({
  privacidad: Joi.string().trim().valid("publico", "privado", "contactos").optional(),
  email_visible: Joi.boolean().optional(),
  pub_inscripciones: Joi.boolean().optional(),
  pub_regularizaciones: Joi.boolean().optional(),
  pub_aprobaciones: Joi.boolean().optional(),
}).min(1);

module.exports = {
  actualizarPerfilSchema,
  actualizarPrivacidadSchema,
};
