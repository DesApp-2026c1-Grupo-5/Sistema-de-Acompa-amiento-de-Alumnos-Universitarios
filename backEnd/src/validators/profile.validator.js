const Joi = require("joi");

const nullableTrimmedString = (field, max) =>
  Joi.any()
    .custom((value, helpers) => {
      if (value === null) return null;
      if (typeof value !== "string") return helpers.error("profile.stringBase");

      const normalized = value.trim();
      if (normalized === "") return null;
      if ([...normalized].length > max) {
        return helpers.error("profile.stringMax", { limit: max });
      }

      return normalized;
    })
    .messages({
      "profile.stringBase": `${field} debe ser un texto o null.`,
      "profile.stringMax": `${field} no puede superar los {#limit} caracteres.`,
    });

const telefonoSchema = Joi.any()
  .custom((value, helpers) => {
    if (value === null) return null;
    if (typeof value !== "string") return helpers.error("phone.stringBase");

    const normalized = value.trim();
    if (normalized === "") return null;
    if (normalized.length > 32) return helpers.error("phone.max");
    if (!/^\+?[0-9 ()-]+$/.test(normalized)) {
      return helpers.error("phone.format");
    }

    const digitCount = (normalized.match(/[0-9]/g) || []).length;
    if (digitCount < 8 || digitCount > 15) {
      return helpers.error("phone.digits");
    }

    return normalized;
  })
  .messages({
    "phone.stringBase": "El teléfono debe ser un texto o null.",
    "phone.max": "El teléfono no puede superar los 32 caracteres.",
    "phone.format":
      "El teléfono solo puede contener dígitos, espacios, un + inicial, guiones y paréntesis.",
    "phone.digits": "El teléfono debe contener entre 8 y 15 dígitos.",
  });

const fechaNacimientoSchema = Joi.any()
  .custom((value, helpers) => {
    if (value === null) return null;
    if (typeof value !== "string") return helpers.error("birthDate.format");

    const normalized = value.trim();
    if (normalized === "") return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return helpers.error("birthDate.format");
    }

    const [year, month, day] = normalized.split("-").map(Number);
    const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const daysByMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysByMonth[month - 1]) {
      return helpers.error("birthDate.real");
    }

    const argentinaDate = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(new Date());
    const dateParts = Object.fromEntries(
      argentinaDate.filter(({ type }) => type !== "literal").map(({ type, value }) => [type, Number(value)])
    );
    const currentMonth = dateParts.month;
    const currentDay = dateParts.day;
    let age = dateParts.year - year;
    if (month > currentMonth || (month === currentMonth && day > currentDay)) age -= 1;
    if (age < 16) return helpers.error("birthDate.minimumAge");

    return normalized;
  })
  .messages({
    "birthDate.format": "La fecha de nacimiento debe tener el formato AAAA-MM-DD.",
    "birthDate.real": "La fecha de nacimiento debe ser una fecha real.",
    "birthDate.minimumAge": "Debes tener al menos 16 años.",
  });

const actualizarPerfilSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "El nombre debe ser un texto.",
    "string.empty": "El nombre no puede estar vacío.",
    "string.min": "El nombre debe tener al menos 2 caracteres.",
    "string.max": "El nombre no puede superar los 100 caracteres.",
  }),
  apellido: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "El apellido debe ser un texto.",
    "string.empty": "El apellido no puede estar vacío.",
    "string.min": "El apellido debe tener al menos 2 caracteres.",
    "string.max": "El apellido no puede superar los 100 caracteres.",
  }),
  bio: nullableTrimmedString("La biografía", 500).optional(),
  localidad: nullableTrimmedString("La localidad", 120).optional(),
  telefono: telefonoSchema.optional(),
  fecha_nacimiento: fechaNacimientoSchema.optional(),
  pub_inscripciones: Joi.boolean().optional().messages({
    "boolean.base": "La preferencia de publicaciones de inscripciones debe ser verdadera o falsa.",
  }),
  pub_regularizaciones: Joi.boolean().optional().messages({
    "boolean.base": "La preferencia de publicaciones de regularizaciones debe ser verdadera o falsa.",
  }),
  pub_aprobaciones: Joi.boolean().optional().messages({
    "boolean.base": "La preferencia de publicaciones de aprobaciones debe ser verdadera o falsa.",
  }),
})
  .min(1)
  .messages({
    "object.min": "Debes enviar al menos un campo para actualizar el perfil.",
    "object.unknown": "El campo {#label} no está permitido en la edición del perfil.",
  });

const actualizarPrivacidadSchema = Joi.object({
  privacidad: Joi.string()
    .trim()
    .valid("publico", "privado", "contactos")
    .optional()
    .messages({
      "string.base": "La privacidad debe ser un texto.",
      "any.only": "La privacidad debe ser publico, privado o contactos.",
    }),
  email_visible: Joi.boolean().optional().messages({
    "boolean.base": "La visibilidad del email debe ser verdadera o falsa.",
  }),
  pub_inscripciones: Joi.boolean().optional().messages({
    "boolean.base": "La preferencia de publicaciones de inscripciones debe ser verdadera o falsa.",
  }),
  pub_regularizaciones: Joi.boolean().optional().messages({
    "boolean.base": "La preferencia de publicaciones de regularizaciones debe ser verdadera o falsa.",
  }),
  pub_aprobaciones: Joi.boolean().optional().messages({
    "boolean.base": "La preferencia de publicaciones de aprobaciones debe ser verdadera o falsa.",
  }),
})
  .min(1)
  .messages({
    "object.min": "Debes enviar al menos una preferencia de privacidad.",
  });

module.exports = {
  actualizarPerfilSchema,
  actualizarPrivacidadSchema,
};
