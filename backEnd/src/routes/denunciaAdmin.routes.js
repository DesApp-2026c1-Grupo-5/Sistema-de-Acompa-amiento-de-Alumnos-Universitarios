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
  denunciaIdParamSchema,
} = require("../validators/denunciaAdmin.validator");

const {
  listarStats,
  listarDenuncias,
  obtenerDetalle,
  obtenerDetallePost,
  rechazarDenuncias,
  rechazarDenunciasPost,
  suspenderMaterial,
  restaurarMaterial,
  rechazarDenuncia,
  suspenderPost,
  restaurarPost,
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
  "/admin/posts/:id/denuncias/rechazar",
  authMiddleware,
  requireAdmin,
  validate(denunciaAdminIdParamSchema, "params"),
  rechazarDenunciasPost
);

router.patch(
  "/admin/denuncias/:denunciaId/rechazar",
  authMiddleware,
  requireAdmin,
  validate(denunciaIdParamSchema, "params"),
  rechazarDenuncia
);

router.patch(
  "/admin/posts/:id/suspender",
  authMiddleware,
  requireAdmin,
  validate(
    denunciaAdminIdParamSchema,
    "params"
  ),
  suspenderPost
);

router.patch(
  "/admin/posts/:id/restaurar",
  authMiddleware,
  requireAdmin,
  validate(
    denunciaAdminIdParamSchema,
    "params"
  ),
  restaurarPost
);

module.exports = router;
