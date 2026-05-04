const { verifyToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      message: "Token de autenticacion requerido",
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      ok: false,
      message: "Formato de token invalido",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      tipo: decoded.tipo,
    };
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authMiddleware;
