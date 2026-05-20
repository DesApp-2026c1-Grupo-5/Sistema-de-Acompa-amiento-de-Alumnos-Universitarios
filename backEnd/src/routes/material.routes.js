const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { listarMaterialesQuerySchema } = require("../validators/material.validator");

const materialController = require("../controllers/material.controller");
const {
  listarMateriales,
  obtenerMaterialPorId,
  crearMaterial,
  votarMaterial,
} = materialController;

router.get(
  "/materiales",
  authMiddleware,
  validate(listarMaterialesQuerySchema, "query"),
  listarMateriales
);
router.get("/materiales/:id", authMiddleware, obtenerMaterialPorId);

router.post("/materiales", authMiddleware, crearMaterial);

router.post("/materiales/votar", authMiddleware, votarMaterial);

module.exports = router;
