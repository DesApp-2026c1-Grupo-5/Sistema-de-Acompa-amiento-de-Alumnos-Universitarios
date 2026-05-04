const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const materialController = require("../controllers/material.controller");

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