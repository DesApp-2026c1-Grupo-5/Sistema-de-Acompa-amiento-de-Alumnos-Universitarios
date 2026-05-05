const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const sesionEstudioController = require("../controllers/sesionEstudio.controller");

const router = express.Router();

router.get("/sesiones", authMiddleware, sesionEstudioController.listarSesiones);
router.post("/sesiones", authMiddleware, sesionEstudioController.crearSesion);

module.exports = router;
