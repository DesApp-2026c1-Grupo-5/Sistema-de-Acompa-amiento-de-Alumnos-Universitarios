const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  obtenerPlan,
  crearPlan,
  actualizarPlan,
  actualizarPlanCompleto,
} = require("../controllers/planEstudio.controller");
const {
  crearPlanSchema,
  actualizarPlanSchema,
  actualizarPlanCompletoSchema,
} = require("../validators/planEstudio.validator");

router.get("/planes-estudio/:id", authMiddleware, requireAdmin, obtenerPlan);

router.post(
  "/carreras/:carreraId/planes",
  authMiddleware,
  requireAdmin,
  validate(crearPlanSchema),
  crearPlan
);

router.patch(
  "/planes-estudio/:id",
  authMiddleware,
  requireAdmin,
  validate(actualizarPlanSchema),
  actualizarPlan
);

router.put(
  "/planes-estudio/:id",
  authMiddleware,
  requireAdmin,
  validate(actualizarPlanCompletoSchema),
  actualizarPlanCompleto
);

module.exports = router;
