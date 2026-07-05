const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createAdminSchema,
  adminIdParamSchema,
  listarAdminsQuerySchema,
} = require("../validators/admin.validator");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.get(
  "/admins",
  authMiddleware,
  requireAdmin,
  validate(listarAdminsQuerySchema, "query"),
  adminController.obtenerAdmins
);

router.post(
  "/admins",
  authMiddleware,
  requireAdmin,
  validate(createAdminSchema),
  adminController.crearAdmin
);

router.delete(
  "/admins/:id",
  authMiddleware,
  requireAdmin,
  validate(adminIdParamSchema, "params"),
  adminController.eliminarAdmin
);

router.get(
  "/admin/home/students/search",
  authMiddleware,
  requireAdmin,
  adminController.buscarEstudiantes
);

module.exports = router;