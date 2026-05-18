const Joi = require("joi");

const PASSWORD_MIN = 6;

const email = Joi.string()
  .trim()
  .lowercase()
  .email({ minDomainSegments: 2, tlds: false })
  .required()
  .messages({
    "string.base": "Email debe ser texto",
    "string.empty": "Email es obligatorio",
    "string.email": "Email inválido",
    "any.required": "Email es obligatorio",
  });

const password = Joi.string()
  .min(PASSWORD_MIN)
  .required()
  .messages({
    "string.base": "Password debe ser texto",
    "string.empty": "Password es obligatoria",
    "string.min": `La password debe tener al menos ${PASSWORD_MIN} caracteres`,
    "any.required": "Password es obligatoria",
  });

const nombreCompleto = Joi.string()
  .trim()
  .pattern(/^\S+\s+\S+/)
  .required()
  .messages({
    "string.base": "Nombre completo debe ser texto",
    "string.empty": "Nombre completo es obligatorio",
    "string.pattern.base": "Ingresá nombre y apellido",
    "any.required": "Nombre completo es obligatorio",
  });

const loginSchema = Joi.object({
  email,
  password,
});

const registerSchema = Joi.object({
  nombre_completo: nombreCompleto,
  email,
  password,
});

module.exports = {
  loginSchema,
  registerSchema,
};
