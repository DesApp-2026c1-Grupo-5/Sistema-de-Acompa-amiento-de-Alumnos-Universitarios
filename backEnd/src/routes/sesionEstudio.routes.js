const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const asyncHandler = require("../middlewares/asyncHandler");
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
  asyncHandler(sesionEstudioController.listarSesiones)
);

router.get(
  "/sesiones/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  asyncHandler(sesionEstudioController.obtenerSesion)
);

router.post(
  "/sesiones",
  authMiddleware,
  validate(crearSesionSchema),
  asyncHandler(sesionEstudioController.crearSesion)
);

router.put(
  "/sesiones/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  validate(editarSesionSchema),
  asyncHandler(sesionEstudioController.editarSesion)
);

router.patch(
  "/sesiones/:id/cancelar",
  authMiddleware,
  validate(idParamSchema, "params"),
  asyncHandler(sesionEstudioController.cancelarSesion)
);

module.exports = router;
