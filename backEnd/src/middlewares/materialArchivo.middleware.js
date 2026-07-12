const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const {
  EXTENSIONES_PERMITIDAS,
  esExtensionPermitida,
  esMimeCoherente,
  obtenerCarpetaEstudiante,
  obtenerExtensionNormalizada,
} = require("../services/materialArchivo.service");

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const crearErrorCarga = (code) => {
  const error = new Error(code);
  error.code = code;
  return error;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.estudiante?.id) {
      return cb(crearErrorCarga("ESTUDIANTE_NO_CARGADO"));
    }

    const folder = obtenerCarpetaEstudiante(req.estudiante.id);
    return fs.mkdir(folder, { recursive: true }, (error) => cb(error, folder));
  },
  filename: (req, file, cb) => {
    const extension = obtenerExtensionNormalizada(file.originalname);
    return cb(null, `${crypto.randomUUID()}.${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
    fields: 8,
    parts: 9,
    fieldSize: 16 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const extension = obtenerExtensionNormalizada(file.originalname);

    if (!esExtensionPermitida(extension)) {
      return cb(crearErrorCarga("EXTENSION_NO_PERMITIDA"));
    }

    if (!esMimeCoherente(extension, file.mimetype)) {
      return cb(crearErrorCarga("MIME_NO_COHERENTE"));
    }

    return cb(null, true);
  },
});

const validarCargaMaterial = (req, res, next) => {
  const handler = upload.single("archivo");

  return handler(req, res, (error) => {
    if (error) {
      let message = "No se pudo procesar la carga del archivo";

      if (error.code === "LIMIT_FILE_SIZE") {
        message = "El archivo puede pesar hasta 25 MB";
      } else if (
        error.code === "LIMIT_FILE_COUNT" ||
        error.code === "LIMIT_UNEXPECTED_FILE"
      ) {
        message = "Debe enviar un unico archivo en el campo archivo";
      } else if (error.code === "EXTENSION_NO_PERMITIDA") {
        message = `Extension no permitida. Use: ${EXTENSIONES_PERMITIDAS.join(", ")}`;
      } else if (error.code === "MIME_NO_COHERENTE") {
        message = "El tipo MIME no coincide con la extension del archivo";
      } else if (error.code === "ESTUDIANTE_NO_CARGADO") {
        message = "No se pudo identificar al estudiante que realiza la carga";
      } else if (
        error.code === "LIMIT_FIELD_COUNT" ||
        error.code === "LIMIT_PART_COUNT" ||
        error.code === "LIMIT_FIELD_VALUE"
      ) {
        message = "Los datos del material exceden los limites permitidos";
      } else if (!(error instanceof multer.MulterError)) {
        return next(error);
      }

      return res.status(400).json({ ok: false, message });
    }

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "Debe enviar un archivo en el campo archivo",
      });
    }

    return next();
  });
};

module.exports = { validarCargaMaterial };
