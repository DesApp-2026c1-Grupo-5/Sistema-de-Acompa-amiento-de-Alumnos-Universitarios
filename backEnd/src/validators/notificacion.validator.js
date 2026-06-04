const Joi = require("joi");

const notificacionIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listarNotificacionesQuerySchema = Joi.object({
  tipo: Joi.string().valid("academic", "session", "material").optional(),
  leida: Joi.boolean().optional(),
});

module.exports = {
  notificacionIdParamSchema,
  listarNotificacionesQuerySchema,
};
