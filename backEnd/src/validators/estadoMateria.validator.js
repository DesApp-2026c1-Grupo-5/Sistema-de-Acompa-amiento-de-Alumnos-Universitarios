const Joi = require("joi");

const materiaIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const estadoMateriaBodySchema = Joi.object({
  anio: Joi.number().integer().positive().allow(null),
  cuatrimestre: Joi.number().integer().min(1).max(2).allow(null),
  nota: Joi.number().min(0).max(10).allow(null),
  fecha: Joi.date().allow(null),
});

module.exports = {
  materiaIdParamSchema,
  estadoMateriaBodySchema,
};
