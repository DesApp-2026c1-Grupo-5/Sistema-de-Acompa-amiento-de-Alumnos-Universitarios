const logger = require("../utils/logger");

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

  // Errores inesperados (sin statusCode explícito) no deben filtrar mensajes
  // técnicos (PG, Sequelize, etc.) al cliente. Se loguea el real y se devuelve
  // un mensaje genérico.
  if (!err.statusCode) {
    logger.error("errorHandler", err.message || err);
  }

  const message = err.statusCode
    ? err.message || "Solicitud invalida"
    : "Error interno del servidor";

  const response = {
    ok: false,
    message,
  };

  if (err.statusCode && err.code) {
    response.code = err.code;
  }

  if (err.details) {
    response.details = err.details;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
