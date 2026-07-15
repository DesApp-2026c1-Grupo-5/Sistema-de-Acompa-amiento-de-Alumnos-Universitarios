const { verifyToken } = require("../utils/jwt");
const db = require("../db/models");

const { usuario } = db;

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        ok: false,
        message: "Token de autenticación requerido",
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        ok: false,
        message: "Formato de token inválido",
      });
    }

    const decoded = verifyToken(token);

    const usuarioData = await usuario.findByPk(decoded.sub, {
      attributes: ["id", "email", "tipo", "activo"],
      raw: true,
    });

    if (!usuarioData) {
      return res.status(401).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    if (!usuarioData.activo) {
      return res.status(403).json({
        ok: false,
        message: "La cuenta se encuentra suspendida",
      });
    }

    req.user = {
      sub: usuarioData.id,
      email: usuarioData.email,
      tipo: usuarioData.tipo,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authMiddleware;
