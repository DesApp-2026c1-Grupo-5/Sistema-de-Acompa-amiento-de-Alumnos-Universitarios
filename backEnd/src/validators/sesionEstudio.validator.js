const Joi = require("joi");

const tiposSesion = ["virtual", "presencial"];

const crearSesionSchema = Joi.object({
  materia_id: Joi.number().integer().positive().required(),
  tema: Joi.string().trim().min(3).max(150).required(),
  tipo: Joi.string()
    .trim()
    .valid(...tiposSesion)
    .required(),
  link_ubicacion: Joi.string().trim().max(255).allow("", null),
  fecha_hora: Joi.date().greater("now").required(),
  duracion_minutos: Joi.number().integer().min(1).max(1440).required(),
  cupos_max: Joi.number().integer().positive().allow(null),
  descripcion: Joi.string().trim().max(1000).allow("", null),
  requiere_aprobacion: Joi.boolean().default(false),
  privacidad: Joi.string().valid("public", "private").default("public"),
});

const editarSesionSchema = Joi.object({
  materia_id: Joi.number().integer().positive(),
  tema: Joi.string().trim().min(3).max(150),
  tipo: Joi.string()
    .trim()
    .valid(...tiposSesion),
  link_ubicacion: Joi.string().trim().max(255).allow("", null),
  fecha_hora: Joi.date().greater("now"),
  duracion_minutos: Joi.number().integer().min(1).max(1440),
  cupos_max: Joi.number().integer().positive().allow(null),
  descripcion: Joi.string().trim().max(1000).allow("", null),
  requiere_aprobacion: Joi.boolean(),
  privacidad: Joi.string().valid("public", "private"),
})
  .min(1)
  .messages({ "object.min": "Debe enviar al menos un campo a editar" });

const listarSesionesQuerySchema = Joi.object({
  materia_id: Joi.number().integer().positive(),
  tipo: Joi.string()
    .trim()
    .valid(...tiposSesion),
  desde: Joi.date(),
  hasta: Joi.date(),
  q: Joi.string().trim().max(100),
  disponibilidad: Joi.string().valid("all", "con_cupo", "llenas").default("all"),
  solo_disponibles: Joi.string().valid("true", "false").default("false"),
  vista: Joi.string().valid("todas", "disponibles", "mias").default("todas"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  crearSesionSchema,
  editarSesionSchema,
  listarSesionesQuerySchema,
  idParamSchema,
};
