const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const postController = require("../controllers/post.controller");
const votoPostController = require("../controllers/votoPost.controller");

router.get("/posts", authMiddleware, postController.obtenerPosts);

router.get("/posts/:id", authMiddleware, postController.obtenerPostPorId);

router.post("/posts", authMiddleware, postController.crearPost);

router.post("/posts/:id/voto", authMiddleware, votoPostController.votarPost);

module.exports = router;
