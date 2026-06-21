const Joi = require("joi");

const crearDenunciaSchema = Joi.object({
  motivo_id: Joi.number().integer().positive().required(),
  detalle: Joi.string().trim().max(500).allow("", null),
});

const denunciaMateriaIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const denunciaPostIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  crearDenunciaSchema,
  denunciaMateriaIdParamSchema,
  denunciaPostIdParamSchema,
};
