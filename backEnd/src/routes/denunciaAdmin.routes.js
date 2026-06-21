const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  listarDenunciasQuerySchema,
  materialIdParamSchema,
  postIdParamSchema,
  denunciaAdminIdParamSchema,
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
  validate(materialIdParamSchema, "params"),
  obtenerDetalle
);

router.get(
  "/admin/denuncias/post/:postId",
  authMiddleware,
  requireAdmin,
  validate(postIdParamSchema, "params"),
  obtenerDetallePost
);

router.patch(
  "/admin/materiales/:id/denuncias/verificar",
  authMiddleware,
  requireAdmin,
  validate(denunciaAdminIdParamSchema, "params"),
  verificarDenuncias
);

router.patch(
  "/admin/materiales/:id/denuncias/rechazar",
  authMiddleware,
  requireAdmin,
  validate(denunciaAdminIdParamSchema, "params"),
  rechazarDenuncias
);

router.patch(
  "/admin/materiales/:id/suspender",
  authMiddleware,
  requireAdmin,
  validate(denunciaAdminIdParamSchema, "params"),
  suspenderMaterial
);

router.patch(
  "/admin/materiales/:id/restaurar",
  authMiddleware,
  requireAdmin,
  validate(denunciaAdminIdParamSchema, "params"),
  restaurarMaterial
);

router.patch(
  "/admin/posts/:id/denuncias/verificar",
  authMiddleware,
  requireAdmin,
  validate(denunciaAdminIdParamSchema, "params"),
  verificarDenunciasPost
);

router.patch(
  "/admin/posts/:id/denuncias/rechazar",
  authMiddleware,
  requireAdmin,
  validate(denunciaAdminIdParamSchema, "params"),
  rechazarDenunciasPost
);

router.patch(
  "/admin/posts/:id/ocultar",
  authMiddleware,
  requireAdmin,
  validate(denunciaAdminIdParamSchema, "params"),
  ocultarPost
);

router.patch(
  "/admin/posts/:id/mostrar",
  authMiddleware,
  requireAdmin,
  validate(denunciaAdminIdParamSchema, "params"),
  mostrarPost
);

module.exports = router;
