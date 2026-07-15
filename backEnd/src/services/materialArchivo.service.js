const fs = require("fs");
const path = require("path");

const PRIVATE_UPLOAD_ROOT = path.resolve(__dirname, "..", "..", "private_uploads");
const MATERIAL_UPLOAD_ROOT = path.join(PRIVATE_UPLOAD_ROOT, "materiales");

const MIME_POR_EXTENSION = Object.freeze({
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  jpg: ["image/jpeg"],
  png: ["image/png"],
  zip: ["application/zip", "application/x-zip-compressed"],
});

const EXTENSIONES_PERMITIDAS = Object.keys(MIME_POR_EXTENSION);
const UUID_PATTERN =
  "[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const MANAGED_PATH_PATTERN = new RegExp(
  `^materiales/([1-9]\\d*)/(${UUID_PATTERN})\\.(${EXTENSIONES_PERMITIDAS.join("|")})$`,
  "i"
);

const obtenerExtensionNormalizada = (nombre = "") =>
  path.extname(nombre).slice(1).toLowerCase();

const esExtensionPermitida = (extension) =>
  Object.prototype.hasOwnProperty.call(MIME_POR_EXTENSION, extension);

const esMimeCoherente = (extension, mime = "") =>
  esExtensionPermitida(extension) &&
  MIME_POR_EXTENSION[extension].includes(String(mime).toLowerCase());

const obtenerCarpetaEstudiante = (estudianteId) =>
  path.join(MATERIAL_UPLOAD_ROOT, String(estudianteId));

const construirPathAdministrado = (estudianteId, filename) =>
  path.posix.join("materiales", String(estudianteId), filename);

const parsearPathAdministrado = (urlOPath) => {
  if (typeof urlOPath !== "string") return null;

  const match = MANAGED_PATH_PATTERN.exec(urlOPath);
  if (!match) return null;

  return {
    estudianteId: Number(match[1]),
    filename: `${match[2].toLowerCase()}.${match[3].toLowerCase()}`,
    extension: match[3].toLowerCase(),
  };
};

const obtenerInfoArchivoAdministrado = (materialData) => {
  const parsed = parsearPathAdministrado(materialData?.url_o_path);
  if (!parsed || parsed.estudianteId !== Number(materialData?.estudiante_id)) {
    return null;
  }

  const filePath = path.resolve(
    PRIVATE_UPLOAD_ROOT,
    "materiales",
    String(parsed.estudianteId),
    parsed.filename
  );
  const relative = path.relative(MATERIAL_UPLOAD_ROOT, filePath);

  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  return { ...parsed, filePath };
};

const decorarMaterialDto = (plain) => {
  const administrado = Boolean(obtenerInfoArchivoAdministrado(plain));

  return {
    ...plain,
    url_o_path: administrado ? null : plain.url_o_path,
    archivo_subido: administrado,
    download_url: administrado ? `/api/materiales/${plain.id}/descarga` : null,
  };
};

const eliminarArchivoSubido = async (file) => {
  if (!file?.path) return;

  const filePath = path.resolve(file.path);
  const relative = path.relative(MATERIAL_UPLOAD_ROOT, filePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const existeArchivoRegular = async (filePath) => {
  try {
    const stat = await fs.promises.stat(filePath);
    return stat.isFile();
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
};

const FIRMA_OLE = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const FIRMAS_POR_EXTENSION = Object.freeze({
  pdf: [Buffer.from("%PDF")],
  jpg: [Buffer.from([0xff, 0xd8, 0xff])],
  png: [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  zip: [Buffer.from([0x50, 0x4b])],
  docx: [Buffer.from([0x50, 0x4b])],
  pptx: [Buffer.from([0x50, 0x4b])],
  xlsx: [Buffer.from([0x50, 0x4b])],
  doc: [FIRMA_OLE],
  ppt: [FIRMA_OLE],
  xls: [FIRMA_OLE],
});

const tieneFirmaValida = async (filePath, extension) => {
  const firmas = FIRMAS_POR_EXTENSION[extension];
  if (!firmas) return false;

  const handle = await fs.promises.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(8);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead === 0) return false;
    return firmas.some((firma) => buffer.subarray(0, firma.length).equals(firma));
  } finally {
    await handle.close();
  }
};

const construirNombreDescarga = (titulo, extension, materialId) => {
  const suffix = `.${extension}`;
  let base = String(titulo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(new RegExp(`${suffix.replace(".", "\\.")}$`, "i"), "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  if (!base) base = `material-${materialId}`;
  return `${base}${suffix}`;
};

module.exports = {
  EXTENSIONES_PERMITIDAS,
  MATERIAL_UPLOAD_ROOT,
  construirNombreDescarga,
  construirPathAdministrado,
  decorarMaterialDto,
  eliminarArchivoSubido,
  esExtensionPermitida,
  esMimeCoherente,
  existeArchivoRegular,
  obtenerCarpetaEstudiante,
  obtenerExtensionNormalizada,
  obtenerInfoArchivoAdministrado,
  tieneFirmaValida,
};
