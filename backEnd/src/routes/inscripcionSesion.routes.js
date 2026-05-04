const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const inscripcionSesionController = require(
  "../controllers/inscripcionSesion.controller"
);

router.post(
  "/sesiones/inscribirse",
  authMiddleware,
  inscripcionSesionController.inscribirse
);

module.exports = router;