const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  crearCarreraSchema,
  actualizarCarreraSchema,
} = require("../validators/carrera.validator");
const {
  listarCarreras,
  crearCarrera,
  actualizarCarrera,
} = require("../controllers/carrera.controller");

router.get("/carreras", authMiddleware, requireAdmin, listarCarreras);

router.post(
  "/carreras",
  authMiddleware,
  requireAdmin,
  validate(crearCarreraSchema),
  crearCarrera
);

router.put(
  "/carreras/:id",
  authMiddleware,
  requireAdmin,
  validate(actualizarCarreraSchema),
  actualizarCarrera
);

module.exports = router;
