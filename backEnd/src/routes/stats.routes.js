const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const { getAdminStats } = require("../controllers/stats.controller");

const router = express.Router();

router.get("/admin/stats", authMiddleware, requireAdmin, getAdminStats);

module.exports = router;
