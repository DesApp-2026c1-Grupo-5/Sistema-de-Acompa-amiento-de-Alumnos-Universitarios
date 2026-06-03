const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const validate = require("../middlewares/validate.middleware");
const { createAdminSchema } = require("../validators/admin.validator");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.get("/admins", authMiddleware, requireAdmin, adminController.obtenerAdmins);

router.post(
  "/admins",
  authMiddleware,
  requireAdmin,
  validate(createAdminSchema),
  adminController.crearAdmin
);

router.get(
  "/admin/home/stats",
  authMiddleware,
  requireAdmin,
  adminController.getHomeStats
);

module.exports = router;
