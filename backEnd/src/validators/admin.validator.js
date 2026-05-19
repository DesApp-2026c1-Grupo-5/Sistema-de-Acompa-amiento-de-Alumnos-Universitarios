const Joi = require("joi");

const createAdminSchema = Joi.object({
  nombre: Joi.string().trim().min(2).required().messages({
    "string.base": "El nombre debe ser texto",
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre es muy corto",
    "any.required": "El nombre es obligatorio",
  }),
  apellido: Joi.string().trim().min(2).required().messages({
    "string.base": "El apellido debe ser texto",
    "string.empty": "El apellido es obligatorio",
    "string.min": "El apellido es muy corto",
    "any.required": "El apellido es obligatorio",
  }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ minDomainSegments: 2, tlds: false })
    .required()
    .messages({
      "string.base": "El email debe ser texto",
      "string.empty": "El email es obligatorio",
      "string.email": "Email inválido",
      "any.required": "El email es obligatorio",
    }),
  password: Joi.string().min(8).required().messages({
    "string.base": "La contraseña debe ser texto",
    "string.empty": "La contraseña es obligatoria",
    "string.min": "La contraseña debe tener al menos 8 caracteres",
    "any.required": "La contraseña es obligatoria",
  }),
});

module.exports = { createAdminSchema };
