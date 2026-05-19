const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  sesionParamSchema,
  inscripcionParamSchema,
  inscribirseBodySchema,
} = require("../validators/inscripcionSesion.validator");

const inscripcionSesionController = require(
  "../controllers/inscripcionSesion.controller"
);

router.post(
  "/sesiones/:id/inscripciones",
  authMiddleware,
  validate(sesionParamSchema, "params"),
  inscripcionSesionController.inscribirse
);

router.delete(
  "/sesiones/:id/inscripciones/mi-inscripcion",
  authMiddleware,
  validate(sesionParamSchema, "params"),
  inscripcionSesionController.cancelarMiInscripcion
);

router.patch(
  "/sesiones/:id/inscripciones/:inscripcionId/aprobar",
  authMiddleware,
  validate(inscripcionParamSchema, "params"),
  inscripcionSesionController.aprobarParticipante
);

router.patch(
  "/sesiones/:id/inscripciones/:inscripcionId/rechazar",
  authMiddleware,
  validate(inscripcionParamSchema, "params"),
  inscripcionSesionController.rechazarParticipante
);

router.post(
  "/sesiones/inscribirse",
  authMiddleware,
  validate(inscribirseBodySchema),
  inscripcionSesionController.inscribirseLegacy
);

module.exports = router;
