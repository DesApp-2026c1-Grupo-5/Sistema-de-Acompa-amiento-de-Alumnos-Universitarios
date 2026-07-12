const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { cargarEstudianteActual } = require("../middlewares/estudianteActual.middleware");
const { validarCargaMaterial } = require("../middlewares/materialArchivo.middleware");
const { listarMaterialesQuerySchema } = require("../validators/material.validator");

const materialController = require("../controllers/material.controller");
const {
  listarMateriales,
  obtenerMaterialPorId,
  crearMaterial,
  crearMaterialArchivo,
  descargarMaterial,
  votarMaterial,
} = materialController;

router.get(
  "/materiales",
  authMiddleware,
  validate(listarMaterialesQuerySchema, "query"),
  listarMateriales
);
router.get("/materiales/:id/descarga", authMiddleware, descargarMaterial);
router.get("/materiales/:id", authMiddleware, obtenerMaterialPorId);

router.post("/materiales", authMiddleware, crearMaterial);
router.post(
  "/materiales/archivo",
  authMiddleware,
  cargarEstudianteActual,
  validarCargaMaterial,
  crearMaterialArchivo
);

router.post("/materiales/votar", authMiddleware, votarMaterial);

module.exports = router;
