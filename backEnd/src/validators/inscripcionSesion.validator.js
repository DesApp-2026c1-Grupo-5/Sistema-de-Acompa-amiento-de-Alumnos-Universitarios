const Joi = require("joi");

const sesionParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const inscripcionParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  inscripcionId: Joi.number().integer().positive().required(),
});

const inscribirseBodySchema = Joi.object({});

module.exports = {
  sesionParamSchema,
  inscripcionParamSchema,
  inscribirseBodySchema,
};
