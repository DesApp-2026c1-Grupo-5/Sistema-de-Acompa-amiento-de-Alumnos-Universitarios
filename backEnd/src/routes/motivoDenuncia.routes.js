const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  crearMotivoSchema,
  editarMotivoSchema,
} = require("../validators/motivoDenuncia.validator");
const {
  listarMotivosAdmin,
  crearMotivo,
  editarMotivo,
  eliminarMotivo,
} = require("../controllers/motivoDenuncia.controller");

router.get(
  "/admin/motivos-denuncia",
  authMiddleware,
  requireAdmin,
  listarMotivosAdmin
);

router.post(
  "/admin/motivos-denuncia",
  authMiddleware,
  requireAdmin,
  validate(crearMotivoSchema),
  crearMotivo
);

router.put(
  "/admin/motivos-denuncia/:id",
  authMiddleware,
  requireAdmin,
  validate(editarMotivoSchema),
  editarMotivo
);

router.delete(
  "/admin/motivos-denuncia/:id",
  authMiddleware,
  requireAdmin,
  eliminarMotivo
);

module.exports = router;
