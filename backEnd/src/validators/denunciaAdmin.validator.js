const Joi = require("joi");

const listarDenunciasQuerySchema = Joi.object({
  q: Joi.string().trim().max(100).allow(""),
  estado: Joi.string()
    .valid("pendiente", "verificada", "rechazada", "suspendido", "todos")
    .default("todos"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

module.exports = {
  listarDenunciasQuerySchema,
};
