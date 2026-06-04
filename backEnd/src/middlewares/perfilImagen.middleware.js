const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { existModelBy } = require("./genericMiddleware");
const { estudiante } = require("../db/models");

const uploadRoot = path.join(__dirname, "..", "..", "uploads", "perfiles");
fs.mkdirSync(uploadRoot, { recursive: true });

const MIME_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const buildPerfilFolder = (estudianteId) =>
  path.join(uploadRoot, String(estudianteId));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = buildPerfilFolder(req.estudiante.id);
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const unique = `${Date.now()}-${crypto.randomUUID()}`;
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (MIME_PERMITIDOS.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("FORMATO_INVALIDO"));
  },
});

const cargarEstudianteActual = existModelBy(estudiante, "usuario_id", "user.sub");

const validarCargaImagen = (campo) => (req, res, next) => {
  const handler = upload.single(campo);

  return handler(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          ok: false,
          message: "La imagen puede pesar hasta 5 MB",
        });
      }

      if (err.message === "FORMATO_INVALIDO") {
        return res.status(400).json({
          ok: false,
          message: "Formato no permitido. Use JPG, PNG, WEBP o GIF",
        });
      }

      return res.status(400).json({
        ok: false,
        message: "No se pudo procesar la carga de la imagen",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "Debe enviar una imagen",
      });
    }

    return next();
  });
};

module.exports = {
  cargarEstudianteActual,
  validarCargaFoto: validarCargaImagen("foto"),
  validarCargaBanner: validarCargaImagen("banner"),
};
