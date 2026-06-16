const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { crearDenunciaSchema } = require("../validators/denuncia.validator");

const {
  listarMotivos,
  crearDenunciaMaterial,
  crearDenunciaPost,
} = require("../controllers/denuncia.controller");

router.get("/motivos-denuncia", authMiddleware, listarMotivos);

router.post(
  "/materiales/:id/denuncias",
  authMiddleware,
  validate(crearDenunciaSchema),
  crearDenunciaMaterial
);

router.post(
  "/posts/:id/denuncias",
  authMiddleware,
  validate(crearDenunciaSchema),
  crearDenunciaPost
);

module.exports = router;
