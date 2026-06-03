const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const { obtenerPlan } = require("../controllers/planEstudio.controller");

router.get("/planes-estudio/:id", authMiddleware, requireAdmin, obtenerPlan);

module.exports = router;
