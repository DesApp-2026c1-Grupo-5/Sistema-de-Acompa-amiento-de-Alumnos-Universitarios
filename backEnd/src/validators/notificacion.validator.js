const Joi = require("joi");

const notificacionIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listarNotificacionesQuerySchema = Joi.object({
  tipo: Joi.string().valid("academic", "session", "material", "general").optional(),
  leida: Joi.boolean().optional(),
});

const marcarLeidasBodySchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).optional(),
}).min(1);

module.exports = {
  notificacionIdParamSchema,
  listarNotificacionesQuerySchema,
  marcarLeidasBodySchema,
};
