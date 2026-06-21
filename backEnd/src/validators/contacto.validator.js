const Joi = require("joi");

const invitacionIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const estudianteIdParamSchema = Joi.object({
  estudianteId: Joi.number().integer().positive().required(),
});

module.exports = {
  invitacionIdParamSchema,
  estudianteIdParamSchema,
};
