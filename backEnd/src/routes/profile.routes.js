const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
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

module.exports = router;
