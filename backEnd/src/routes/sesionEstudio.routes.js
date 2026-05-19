const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  crearSesionSchema,
  editarSesionSchema,
  listarSesionesQuerySchema,
  idParamSchema,
} = require("../validators/sesionEstudio.validator");
const sesionEstudioController = require("../controllers/sesionEstudio.controller");

const router = express.Router();

router.get(
  "/sesiones",
  authMiddleware,
  validate(listarSesionesQuerySchema, "query"),
  sesionEstudioController.listarSesiones
);

router.get(
  "/sesiones/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  sesionEstudioController.obtenerSesion
);

router.post(
  "/sesiones",
  authMiddleware,
  validate(crearSesionSchema),
  sesionEstudioController.crearSesion
);

router.put(
  "/sesiones/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  validate(editarSesionSchema),
  sesionEstudioController.editarSesion
);

router.patch(
  "/sesiones/:id/cancelar",
  authMiddleware,
  validate(idParamSchema, "params"),
  sesionEstudioController.cancelarSesion
);

module.exports = router;
