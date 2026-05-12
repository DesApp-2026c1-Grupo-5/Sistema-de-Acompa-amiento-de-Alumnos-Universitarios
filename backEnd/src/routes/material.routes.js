const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const materialController = require("../controllers/material.controller");
const {
  listarMateriales,
  obtenerMaterialPorId,
  crearMaterial,
  votarMaterial,
} = materialController;

router.get("/materiales", authMiddleware, listarMateriales);
router.get("/materiales/:id", authMiddleware, obtenerMaterialPorId);

router.post("/materiales", authMiddleware, crearMaterial);

router.post("/materiales/votar", authMiddleware, votarMaterial);

module.exports = router;
