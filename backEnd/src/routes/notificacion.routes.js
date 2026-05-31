const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const notificacionController = require("../controllers/notificacion.controller");
const {
  listarNotificacionesQuerySchema,
} = require("../validators/notificacion.validator");

const router = express.Router();

router.get(
  "/notificaciones",
  authMiddleware,
  validate(listarNotificacionesQuerySchema, "query"),
  notificacionController.listarMisNotificaciones
);

module.exports = router;
