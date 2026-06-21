const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { getAcademicAssistant, getPlanSubjects } = require("../controllers/academicAssistant.controller");

const router = express.Router();

router.get("/student/academic-assistant", authMiddleware, getAcademicAssistant);
router.get("/student/academic-assistant/plan-subjects", authMiddleware, getPlanSubjects);

module.exports = router;
