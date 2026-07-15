const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { crearPostSchema, votarPostSchema, postIdParamSchema } = require("../validators/post.validator");
const postController = require("../controllers/post.controller");
const votoPostController = require("../controllers/votoPost.controller");

router.get("/posts", authMiddleware, postController.obtenerPosts);

router.get("/posts/:id", authMiddleware, postController.obtenerPostPorId);

router.post("/posts", authMiddleware, validate(crearPostSchema), postController.crearPost);

router.delete("/posts/:id", authMiddleware, validate(postIdParamSchema, "params"), postController.eliminarPost);

router.post("/posts/:id/voto", authMiddleware, validate(postIdParamSchema, "params"), validate(votarPostSchema), votoPostController.votarPost);

module.exports = router;
