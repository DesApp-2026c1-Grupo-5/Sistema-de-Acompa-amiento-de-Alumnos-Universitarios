const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { listarMaterias } = require("../controllers/materia.controller");

const router = express.Router();

router.get("/materias", authMiddleware, listarMaterias);

module.exports = router;
