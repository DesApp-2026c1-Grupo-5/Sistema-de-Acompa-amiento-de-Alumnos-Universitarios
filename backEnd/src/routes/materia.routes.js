const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const {
  listarMaterias,
  listarMateriasAdmin,
} = require("../controllers/materia.controller");

const router = express.Router();

router.get("/materias", authMiddleware, listarMaterias);

router.get("/admin/materias", authMiddleware, requireAdmin, listarMateriasAdmin);

module.exports = router;
