const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  materiaIdParamSchema,
  estadoMateriaBodySchema,
} = require("../validators/estadoMateria.validator");
const estadoMateriaController = require("../controllers/estadoMateria.controller");

const router = express.Router();

router.post(
  "/materias/:id/inscribir",
  authMiddleware,
  validate(materiaIdParamSchema, "params"),
  validate(estadoMateriaBodySchema),
  estadoMateriaController.inscribirMateria
);

router.post(
  "/materias/:id/regularizar",
  authMiddleware,
  validate(materiaIdParamSchema, "params"),
  validate(estadoMateriaBodySchema),
  estadoMateriaController.regularizarMateria
);

router.post(
  "/materias/:id/aprobar",
  authMiddleware,
  validate(materiaIdParamSchema, "params"),
  validate(estadoMateriaBodySchema),
  estadoMateriaController.aprobarMateria
);

module.exports = router;
