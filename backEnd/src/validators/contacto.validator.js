const Joi = require("joi");

const invitacionIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  invitacionIdParamSchema,
};
