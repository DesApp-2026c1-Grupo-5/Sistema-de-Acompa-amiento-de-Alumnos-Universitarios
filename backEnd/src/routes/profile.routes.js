const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const profileController = require("../controllers/profile.controller");

const router = express.Router();

router.get("/profile/me", authMiddleware, profileController.obtenerMiPerfil);
router.put("/profile/me", authMiddleware, profileController.actualizarMiPerfil);

module.exports = router;
