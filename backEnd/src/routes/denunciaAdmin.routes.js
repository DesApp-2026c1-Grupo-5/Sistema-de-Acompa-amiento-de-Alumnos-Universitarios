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
  obtenerDetallePost,
  verificarDenuncias,
  rechazarDenuncias,
  verificarDenunciasPost,
  rechazarDenunciasPost,
  suspenderMaterial,
  restaurarMaterial,
  ocultarPost,
  mostrarPost,
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

router.get(
  "/admin/denuncias/post/:postId",
  authMiddleware,
  requireAdmin,
  obtenerDetallePost
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

router.patch(
  "/admin/posts/:id/denuncias/verificar",
  authMiddleware,
  requireAdmin,
  verificarDenunciasPost
);

router.patch(
  "/admin/posts/:id/denuncias/rechazar",
  authMiddleware,
  requireAdmin,
  rechazarDenunciasPost
);

router.patch(
  "/admin/posts/:id/ocultar",
  authMiddleware,
  requireAdmin,
  ocultarPost
);

router.patch(
  "/admin/posts/:id/mostrar",
  authMiddleware,
  requireAdmin,
  mostrarPost
);

module.exports = router;
