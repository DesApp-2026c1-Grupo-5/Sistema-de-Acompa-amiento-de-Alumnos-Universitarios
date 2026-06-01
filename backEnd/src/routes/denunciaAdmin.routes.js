const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  listarDenunciasQuerySchema,
} = require("../validators/denunciaAdmin.validator");

const {
  listarStats,
  listarDenuncias,
  obtenerDetalle,
  verificarDenuncias,
  rechazarDenuncias,
  suspenderMaterial,
  restaurarMaterial,
} = require("../controllers/denunciaAdmin.controller");

router.get("/admin/denuncias/stats", authMiddleware, requireAdmin, listarStats);

router.get(
  "/admin/denuncias",
  authMiddleware,
  requireAdmin,
  validate(listarDenunciasQuerySchema, "query"),
  listarDenuncias
);

router.get(
  "/admin/denuncias/material/:materialId",
  authMiddleware,
  requireAdmin,
  obtenerDetalle
);

router.patch(
  "/admin/materiales/:id/denuncias/verificar",
  authMiddleware,
  requireAdmin,
  verificarDenuncias
);

router.patch(
  "/admin/materiales/:id/denuncias/rechazar",
  authMiddleware,
  requireAdmin,
  rechazarDenuncias
);

router.patch(
  "/admin/materiales/:id/suspender",
  authMiddleware,
  requireAdmin,
  suspenderMaterial
);

router.patch(
  "/admin/materiales/:id/restaurar",
  authMiddleware,
  requireAdmin,
  restaurarMaterial
);

module.exports = router;
