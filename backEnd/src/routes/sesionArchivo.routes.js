const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  cargarSesion,
  cargarEstudianteActual,
  validarPropietarioSesion,
  validarCargaArchivos,
} = require("../middlewares/sesionArchivo.middleware");
const { sesionIdParamSchema } = require("../validators/sesionArchivo.validator");
const sesionArchivoController = require("../controllers/sesionArchivo.controller");

const router = express.Router();

router.get(
  "/sesiones/:id/archivos",
  authMiddleware,
  validate(sesionIdParamSchema, "params"),
  cargarSesion,
  sesionArchivoController.listarArchivosSesion
);

router.post(
  "/sesiones/:id/archivos",
  authMiddleware,
  validate(sesionIdParamSchema, "params"),
  cargarSesion,
  cargarEstudianteActual,
  validarPropietarioSesion,
  validarCargaArchivos,
  sesionArchivoController.subirArchivosSesion
);

module.exports = router;
