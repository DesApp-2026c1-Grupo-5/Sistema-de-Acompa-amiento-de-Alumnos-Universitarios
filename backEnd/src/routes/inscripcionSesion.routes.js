const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const asyncHandler = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate.middleware");
const {
  sesionParamSchema,
  inscripcionParamSchema,
} = require("../validators/inscripcionSesion.validator");

const inscripcionSesionController = require(
  "../controllers/inscripcionSesion.controller"
);

router.post(
  "/sesiones/:id/inscripciones",
  authMiddleware,
  validate(sesionParamSchema, "params"),
  asyncHandler(inscripcionSesionController.inscribirse)
);

router.delete(
  "/sesiones/:id/inscripciones/mi-inscripcion",
  authMiddleware,
  validate(sesionParamSchema, "params"),
  asyncHandler(inscripcionSesionController.cancelarMiInscripcion)
);

router.patch(
  "/sesiones/:id/inscripciones/:inscripcionId/aprobar",
  authMiddleware,
  validate(inscripcionParamSchema, "params"),
  asyncHandler(inscripcionSesionController.aprobarParticipante)
);

router.patch(
  "/sesiones/:id/inscripciones/:inscripcionId/rechazar",
  authMiddleware,
  validate(inscripcionParamSchema, "params"),
  asyncHandler(inscripcionSesionController.rechazarParticipante)
);

router.post(
  "/sesiones/inscribirse",
  authMiddleware,
  asyncHandler(async (req, res) => {
    req.params.id = req.body.sesion_id;
    return inscripcionSesionController.inscribirse(req, res);
  })
);

module.exports = router;
