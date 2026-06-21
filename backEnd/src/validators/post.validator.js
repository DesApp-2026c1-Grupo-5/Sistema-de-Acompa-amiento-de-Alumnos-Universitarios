const Joi = require("joi");

const crearPostSchema = Joi.object({
  contenido: Joi.string().trim().min(1).max(2000).required(),
  event_type: Joi.string().trim().valid("inscripcion", "regularizacion", "aprobacion", "general").optional(),
  event_subject: Joi.string().trim().max(255).allow("", null).optional(),
});

const votarPostSchema = Joi.object({
  tipo: Joi.string().trim().valid("like", "dislike").required(),
});

const postIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  crearPostSchema,
  votarPostSchema,
  postIdParamSchema,
};
