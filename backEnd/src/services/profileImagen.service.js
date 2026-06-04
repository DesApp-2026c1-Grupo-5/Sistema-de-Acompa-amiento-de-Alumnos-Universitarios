const fs = require("fs");
const path = require("path");

const buildPublicPath = (estudianteId, nombreArchivo) =>
  `/uploads/perfiles/${estudianteId}/${nombreArchivo}`;

const borrarArchivoFisico = (urlOPath) => {
  if (!urlOPath) return;

  const filePath = path.join(__dirname, "..", "..", urlOPath.replace(/^\/+/, ""));

  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
  }
};

const guardarImagenPerfil = async (estudianteData, campo, file) => {
  borrarArchivoFisico(estudianteData[campo]);

  const url = buildPublicPath(estudianteData.id, file.filename);
  await estudianteData.update({ [campo]: url });

  return url;
};

const eliminarImagenPerfil = async (estudianteData, campo) => {
  borrarArchivoFisico(estudianteData[campo]);

  await estudianteData.update({ [campo]: null });

  return null;
};

module.exports = {
  guardarImagenPerfil,
  eliminarImagenPerfil,
};
