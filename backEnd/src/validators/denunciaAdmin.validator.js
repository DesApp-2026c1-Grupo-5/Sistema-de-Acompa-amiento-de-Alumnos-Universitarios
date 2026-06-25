const Joi = require("joi");

const listarDenunciasQuerySchema = Joi.object({
  q: Joi.string().trim().max(100).allow(""),
  estado: Joi.string()
    .valid("pendiente", "verificada", "rechazada", "suspendido", "todos")
    .default("todos"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

const materialIdParamSchema = Joi.object({
  materialId: Joi.number().integer().positive().required(),
  id: Joi.number().integer().positive().optional(),
});

const postIdParamSchema = Joi.object({
  postId: Joi.number().integer().positive().required(),
  id: Joi.number().integer().positive().optional(),
});

const denunciaAdminIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const denunciaIdParamSchema = Joi.object({
  denunciaId: Joi.number().integer().positive().required(),
});

module.exports = {
  listarDenunciasQuerySchema,
  materialIdParamSchema,
  postIdParamSchema,
  denunciaAdminIdParamSchema,
  denunciaIdParamSchema,
};
