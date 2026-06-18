const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const uploadRoot = path.join(__dirname, "..", "..", "uploads", "excel");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".xlsx");
    cb(null, `import-${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowed.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("FORMATO_INVALIDO"));
  },
});

const validarCargaExcel = (req, res, next) => {
  const handler = upload.single("archivo");

  return handler(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ ok: false, message: "El archivo puede pesar hasta 10 MB" });
      }
      if (err.message === "FORMATO_INVALIDO") {
        return res.status(400).json({ ok: false, message: "Formato no permitido. Use .xls o .xlsx" });
      }
      return res.status(400).json({ ok: false, message: "No se pudo procesar la carga del archivo" });
    }

    if (!req.file) {
      return res.status(400).json({ ok: false, message: "Debe enviar un archivo Excel" });
    }

    return next();
  });
};

module.exports = { validarCargaExcel };
