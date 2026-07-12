const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { validarCargaExcel } = require("../middlewares/excelUpload.middleware");
const {
  crearSituacionSchema,
  actualizarMateriasSchema,
  crearFinalSchema,
  crearActividadSchema,
  actualizarActividadSchema,
  actualizarFinalSchema,
} = require("../validators/situacionAcademica.validator");
const {
  crearPlanCursadaSchema,
  actualizarPlanCursadaSchema,
  planCursadaIdParamSchema,
} = require("../validators/planCursada.validator");
const controller = require("../controllers/situacionAcademica.controller");

const router = express.Router();

router.post("/student/academic-situation", authMiddleware, validate(crearSituacionSchema), controller.crearSituacion);
router.get("/student/academic-situation", authMiddleware, controller.obtenerSituacion);
router.patch("/student/academic-situation/subjects", authMiddleware, validate(actualizarMateriasSchema), controller.actualizarMaterias);
router.post("/student/academic-situation/finals", authMiddleware, validate(crearFinalSchema), controller.crearFinal);
router.delete("/student/academic-situation/finals/:id", authMiddleware, controller.eliminarFinal);
router.patch("/student/academic-situation/finals/:id", authMiddleware, validate(actualizarFinalSchema), controller.actualizarFinal);
router.post("/student/academic-situation/credits", authMiddleware, validate(crearActividadSchema), controller.crearActividad);
router.patch("/student/academic-situation/credits/:id", authMiddleware, validate(actualizarActividadSchema), controller.actualizarActividad);
router.delete("/student/academic-situation/credits/:id", authMiddleware, controller.eliminarActividad);
router.post("/student/academic-situation/import-excel", authMiddleware, validarCargaExcel, controller.importarExcel);
router.post("/student/academic-situation/confirm-excel", authMiddleware, controller.confirmarImportacion);
router.patch("/student/academic-situation/change-career",authMiddleware,validate(crearSituacionSchema),controller.cambiarCarrera);

router.post("/student/plan-cursada", authMiddleware, validate(crearPlanCursadaSchema), controller.guardarPlanCursada);
router.get("/student/plan-cursada", authMiddleware, controller.obtenerPlanesCursada);
router.get("/student/plan-cursada/:planCursadaId", authMiddleware, validate(planCursadaIdParamSchema, "params"), controller.obtenerPlanCursada);
router.delete("/student/plan-cursada/:planCursadaId", authMiddleware, validate(planCursadaIdParamSchema, "params"), controller.eliminarPlanCursada);

module.exports = router;
