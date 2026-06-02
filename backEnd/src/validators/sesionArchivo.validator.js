const Joi = require("joi");

const sesionIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  sesionIdParamSchema,
};
