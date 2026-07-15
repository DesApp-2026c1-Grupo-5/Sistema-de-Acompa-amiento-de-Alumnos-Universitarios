const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const validate = require("../middlewares/validate.middleware");
const { listarMateriasQuerySchema } = require("../validators/materia.validator");
const {
  listarMaterias,
  listarMateriasAdmin,
} = require("../controllers/materia.controller");

const router = express.Router();

router.get("/materias", authMiddleware, validate(listarMateriasQuerySchema, "query"), listarMaterias);

router.get("/admin/materias", authMiddleware, requireAdmin, listarMateriasAdmin);

module.exports = router;
