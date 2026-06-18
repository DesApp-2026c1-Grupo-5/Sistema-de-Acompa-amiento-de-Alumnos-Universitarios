const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  crearSituacionSchema,
  actualizarMateriasSchema,
  crearFinalSchema,
  crearActividadSchema,
} = require("../validators/situacionAcademica.validator");
const controller = require("../controllers/situacionAcademica.controller");

const router = express.Router();

router.post("/student/academic-situation", authMiddleware, validate(crearSituacionSchema), controller.crearSituacion);
router.get("/student/academic-situation", authMiddleware, controller.obtenerSituacion);
router.patch("/student/academic-situation/subjects", authMiddleware, validate(actualizarMateriasSchema), controller.actualizarMaterias);
router.post("/student/academic-situation/finals", authMiddleware, validate(crearFinalSchema), controller.crearFinal);
router.delete("/student/academic-situation/finals/:id", authMiddleware, controller.eliminarFinal);
router.post("/student/academic-situation/credits", authMiddleware, validate(crearActividadSchema), controller.crearActividad);
router.delete("/student/academic-situation/credits/:id", authMiddleware, controller.eliminarActividad);

module.exports = router;
