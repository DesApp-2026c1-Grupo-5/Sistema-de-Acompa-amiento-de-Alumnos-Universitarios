const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const genericMiddleware = require("../middlewares/genericMiddleware");
const contactoMiddleware = require("../middlewares/contacto.middleware");
const contactoController = require("../controllers/contacto.controller");
const { invitacionIdParamSchema } = require("../validators/contacto.validator");
const { contacto, estudiante } = require("../db/models");

const router = express.Router();

router.get(
  "/contactos/buscar",
  authMiddleware,
  genericMiddleware.existModelBy(estudiante, "usuario_id", "user.sub"),
  contactoController.buscarUsuarios
);

router.post(
  "/contactos/invitar/:estudianteId",
  authMiddleware,
  genericMiddleware.existModelBy(estudiante, "usuario_id", "user.sub"),
  contactoController.enviarInvitacion
);

router.patch(
  "/contactos/:id/aceptar",
  authMiddleware,
  validate(invitacionIdParamSchema, "params"),
  genericMiddleware.existModelByPk(contacto),
  genericMiddleware.existModelBy(estudiante, "usuario_id", "user.sub"),
  contactoMiddleware.verificarReceptor,
  contactoMiddleware.verificarPendiente,
  contactoController.aceptarInvitacion
);

router.patch(
  "/contactos/:id/ignorar",
  authMiddleware,
  validate(invitacionIdParamSchema, "params"),
  genericMiddleware.existModelByPk(contacto),
  genericMiddleware.existModelBy(estudiante, "usuario_id", "user.sub"),
  contactoMiddleware.verificarReceptor,
  contactoMiddleware.verificarPendiente,
  contactoController.ignorarInvitacion
);

module.exports = router;
