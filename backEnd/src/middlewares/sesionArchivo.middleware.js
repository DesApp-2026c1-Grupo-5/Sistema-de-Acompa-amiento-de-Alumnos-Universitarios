const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { existModelByPk, existModelBy } = require("./genericMiddleware");
const { sesion_estudio, estudiante } = require("../db/models");

const uploadRoot = path.join(__dirname, "..", "..", "uploads", "sesiones");
fs.mkdirSync(uploadRoot, { recursive: true });

const buildSessionFolder = (sesionId) => path.join(uploadRoot, String(sesionId));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = buildSessionFolder(req.sesion_estudio.id);
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path.basename(file.originalname || "archivo", ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_");
    const unique = `${Date.now()}-${crypto.randomUUID()}`;
    cb(null, `${base}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 10,
  },
});

const cargarSesion = existModelByPk(sesion_estudio);

const cargarEstudianteActual = existModelBy(estudiante, "usuario_id", "user.sub");

const validarPropietarioSesion = (req, res, next) => {
  if (req.sesion_estudio.creador_id !== req.estudiante.id) {
    return res.status(403).json({
      ok: false,
      message: "No tiene permisos para gestionar archivos de esta sesion",
    });
  }

  return next();
};

const validarCargaArchivos = (req, res, next) => {
  const handler = upload.array("archivos", 10);

  return handler(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          ok: false,
          message: "Cada archivo puede pesar hasta 20 MB",
        });
      }

      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          ok: false,
          message: "Se pueden subir hasta 10 archivos por vez",
        });
      }

      return res.status(400).json({
        ok: false,
        message: "No se pudo procesar la carga de archivos",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Debe enviar al menos un archivo",
      });
    }

    return next();
  });
};

module.exports = {
  cargarSesion,
  cargarEstudianteActual,
  validarPropietarioSesion,
  validarCargaArchivos,
};
