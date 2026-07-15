const Joi = require("joi");

const crearPlanCursadaSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(150).required(),
  items: Joi.array()
    .items(
      Joi.object({
        materia_id: Joi.number().integer().positive().required(),
        anio_proyectado: Joi.number().integer().min(1).max(10).required(),
        cuatrimestre_proyectado: Joi.number().integer().min(1).max(2).required(),
        horas: Joi.number().integer().min(0).max(80).optional(),
        horas_extra: Joi.number().integer().min(0).max(80).optional(),
      })
    )
    .min(1)
    .required(),
});

const actualizarPlanCursadaSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(150).optional(),
  activo: Joi.boolean().optional(),
  items: Joi.array()
    .items(
      Joi.object({
        materia_id: Joi.number().integer().positive().required(),
        anio_proyectado: Joi.number().integer().min(1).max(10).required(),
        cuatrimestre_proyectado: Joi.number().integer().min(1).max(2).required(),
        horas: Joi.number().integer().min(0).max(80).optional(),
        horas_extra: Joi.number().integer().min(0).max(80).optional(),
      })
    )
    .min(1)
    .optional(),
}).min(1);

const planCursadaIdParamSchema = Joi.object({
  planCursadaId: Joi.number().integer().positive().required(),
});

module.exports = {
  crearPlanCursadaSchema,
  actualizarPlanCursadaSchema,
  planCursadaIdParamSchema,
};
