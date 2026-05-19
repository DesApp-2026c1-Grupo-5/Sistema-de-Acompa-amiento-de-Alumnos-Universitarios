module.exports = (req, res, next) => {
  if (req.user?.tipo !== "administrador") {
    const error = new Error("Acceso solo para administradores");
    error.statusCode = 403;
    return next(error);
  }
  next();
};
