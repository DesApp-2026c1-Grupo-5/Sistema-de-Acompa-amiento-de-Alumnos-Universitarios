const Joi = require("joi");

const listarMateriasQuerySchema = Joi.object({
  plan_id: Joi.number().integer().positive().optional(),
  anio_cursada: Joi.number().integer().min(1).optional(),
});

module.exports = {
  listarMateriasQuerySchema,
};
