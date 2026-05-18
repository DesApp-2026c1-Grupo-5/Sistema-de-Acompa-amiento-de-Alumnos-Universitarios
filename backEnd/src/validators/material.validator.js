const Joi = require("joi");

const listarMaterialesQuerySchema = Joi.object({
  q: Joi.string().trim().max(100),
  tipo: Joi.string().trim(),
  materia_id: Joi.number().integer().positive(),
  suspendido: Joi.string().valid("true", "false", "all").default("false"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

module.exports = {
  listarMaterialesQuerySchema,
};
