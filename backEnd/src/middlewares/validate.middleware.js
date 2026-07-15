const validate = (schema, source = "body", options = {}) => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: true,
    stripUnknown: true,
    convert: true,
    ...options,
  });

  if (error) {
    return res.status(400).json({
      ok: false,
      message: error.details[0].message,
      details: error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      })),
    });
  }

  // En Express 5 req.query es un getter de solo lectura; defineProperty
  // permite reemplazarlo con los valores ya validados/convertidos por Joi.
  Object.defineProperty(req, source, {
    value,
    writable: true,
    configurable: true,
  });
  return next();
};

module.exports = validate;
