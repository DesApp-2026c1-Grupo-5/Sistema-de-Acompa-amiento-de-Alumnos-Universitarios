const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { getAcademicAssistant } = require("../controllers/academicAssistant.controller");

const router = express.Router();

router.get("/student/academic-assistant", authMiddleware, getAcademicAssistant);

module.exports = router;
