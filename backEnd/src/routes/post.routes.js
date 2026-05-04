const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const postController = require("../controllers/post.controller");

router.get("/posts", authMiddleware, postController.obtenerPosts);

router.post("/posts", authMiddleware, postController.crearPost);

module.exports = router;