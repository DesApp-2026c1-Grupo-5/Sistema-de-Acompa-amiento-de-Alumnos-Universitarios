const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const materialController = require("../controllers/material.controller");

router.get("/materiales", authMiddleware, materialController.listarMateriales);
router.get("/materiales/:id", authMiddleware, materialController.obtenerMaterialPorId);

router.post(
  "/materiales",
  authMiddleware,
  materialController.crearMaterial
);

router.post(
  "/materiales/votar",
  authMiddleware,
  materialController.votarMaterial
);

module.exports = router;
