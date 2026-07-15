const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");

const {
  guardarPlanCursada,
  obtenerPlanesCursada,
  obtenerPlanCursada,
  eliminarPlanCursada,
} = require("../controllers/planCursada.controller");

const router = express.Router();

router.post("/student/plan-cursada", authMiddleware, guardarPlanCursada);

router.get("/student/plan-cursada", authMiddleware, obtenerPlanesCursada);

router.get("/student/plan-cursada/:id", authMiddleware, obtenerPlanCursada);

router.delete("/student/plan-cursada/:id", authMiddleware, eliminarPlanCursada);

module.exports = router;