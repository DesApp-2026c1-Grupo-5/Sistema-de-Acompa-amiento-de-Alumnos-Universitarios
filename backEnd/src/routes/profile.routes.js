const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const {
  cargarEstudianteActual,
  validarCargaFoto,
  validarCargaBanner,
} = require("../middlewares/perfilImagen.middleware");
const profileController = require("../controllers/profile.controller");

const router = express.Router();

router.get("/profile/me", authMiddleware, profileController.obtenerMiPerfil);
router.put("/profile/me", authMiddleware, profileController.actualizarMiPerfil);
router.patch(
  "/profile/me/privacy",
  authMiddleware,
  profileController.actualizarPrivacidadMiPerfil
);
router.patch(
  "/profile/me/avatar",
  authMiddleware,
  profileController.actualizarAvatarMiPerfil
);

router.post(
  "/profile/me/avatar",
  authMiddleware,
  cargarEstudianteActual,
  validarCargaFoto,
  profileController.actualizarFotoMiPerfil
);
router.delete(
  "/profile/me/avatar",
  authMiddleware,
  cargarEstudianteActual,
  profileController.eliminarFotoMiPerfil
);

router.post(
  "/profile/me/banner",
  authMiddleware,
  cargarEstudianteActual,
  validarCargaBanner,
  profileController.actualizarBannerMiPerfil
);
router.delete(
  "/profile/me/banner",
  authMiddleware,
  cargarEstudianteActual,
  profileController.eliminarBannerMiPerfil
);

module.exports = router;
