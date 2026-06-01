const Joi = require("joi");

const crearDenunciaSchema = Joi.object({
  motivo_id: Joi.number().integer().positive().required(),
  detalle: Joi.string().trim().max(500).allow("", null),
});

module.exports = {
  crearDenunciaSchema,
};
