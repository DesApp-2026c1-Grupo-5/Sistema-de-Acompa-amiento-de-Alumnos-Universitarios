const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
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

  req.body = value;
  return next();
};

module.exports = validate;
