const validate = (schema, source = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: true,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const e = new Error(error.details[0].message);
    e.statusCode = 400;
    e.details = error.details.map((d) => ({
      field: d.path.join("."),
      message: d.message,
    }));
    throw e;
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
