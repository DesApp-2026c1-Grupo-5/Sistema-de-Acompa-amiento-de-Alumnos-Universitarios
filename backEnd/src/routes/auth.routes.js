const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { loginSchema, registerSchema } = require("../validators/auth.validator");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/auth/login", validate(loginSchema), authController.login);
router.post("/auth/register", validate(registerSchema), authController.register);
router.get("/auth/me", authMiddleware, authController.me);

module.exports = router;
