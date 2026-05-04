const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
    return res.status(401).json({
      ok: false,
      message: "Token invalido o expirado",
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  const response = {
    ok: false,
    message,
  };

  if (err.details) {
    response.details = err.details;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
