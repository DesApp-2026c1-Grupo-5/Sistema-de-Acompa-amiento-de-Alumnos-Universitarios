const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const genericMiddleware = require("../middlewares/genericMiddleware");
const notificacionMiddleware = require("../middlewares/notificacion.middleware");
const notificacionController = require("../controllers/notificacion.controller");
const notificacionAccionesController = require("../controllers/notificacion.acciones.controller");
const {
  notificacionIdParamSchema,
  listarNotificacionesQuerySchema,
} = require("../validators/notificacion.validator");
const { notificacion } = require("../db/models");

const router = express.Router();

router.get(
  "/notificaciones",
  authMiddleware,
  validate(listarNotificacionesQuerySchema, "query"),
  notificacionController.listarMisNotificaciones
);

router.patch(
  "/notificaciones/leidas",
  authMiddleware,
  notificacionAccionesController.marcarTodasComoLeidas
);

router.patch(
  "/notificaciones/:id/leida",
  authMiddleware,
  validate(notificacionIdParamSchema, "params"),
  genericMiddleware.existModelByPk(notificacion),
  notificacionMiddleware.verificarPropietario,
  notificacionAccionesController.marcarComoLeida
);

router.delete(
  "/notificaciones/:id",
  authMiddleware,
  validate(notificacionIdParamSchema, "params"),
  genericMiddleware.existModelByPk(notificacion),
  notificacionMiddleware.verificarPropietario,
  notificacionAccionesController.eliminarNotificacion
);

module.exports = router;
