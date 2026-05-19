const Joi = require("joi");

const sesionParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const inscripcionParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  inscripcionId: Joi.number().integer().positive().required(),
});

const inscribirseBodySchema = Joi.object({
  sesion_id: Joi.number().integer().positive().required(),
});

module.exports = {
  sesionParamSchema,
  inscripcionParamSchema,
  inscribirseBodySchema,
};
