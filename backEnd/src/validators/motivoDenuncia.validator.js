const Joi = require("joi");

const crearMotivoSchema = Joi.object({
  descripcion: Joi.string().trim().min(3).max(200).required(),
  activo: Joi.boolean().default(true),
});

const editarMotivoSchema = Joi.object({
  descripcion: Joi.string().trim().min(3).max(200).required(),
  activo: Joi.boolean(),
});

module.exports = {
  crearMotivoSchema,
  editarMotivoSchema,
};
