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
  agregarMateriaAlPlan,
  actualizarMateriaDelPlan,
  eliminarMateriaDelPlan,
} = require("../controllers/planEstudio.controller");
const {
  crearPlanSchema,
  actualizarPlanSchema,
  actualizarPlanCompletoSchema,
  agregarMateriaSchema,
  actualizarMateriaSchema,
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

router.post(
  "/planes-estudio/:planId/materias",
  authMiddleware,
  requireAdmin,
  validate(agregarMateriaSchema),
  agregarMateriaAlPlan
);

router.put(
  "/planes-estudio/:planId/materias/:materiaId",
  authMiddleware,
  requireAdmin,
  validate(actualizarMateriaSchema),
  actualizarMateriaDelPlan
);

router.delete(
  "/planes-estudio/:planId/materias/:materiaId",
  authMiddleware,
  requireAdmin,
  eliminarMateriaDelPlan
);

module.exports = router;
