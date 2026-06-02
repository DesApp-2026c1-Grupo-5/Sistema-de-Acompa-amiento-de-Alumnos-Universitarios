const { archivo_sesion_estudio, estudiante } = require("../db/models");

const buildPublicPath = (sesionId, nombreArchivo) =>
  `/uploads/sesiones/${sesionId}/${nombreArchivo}`;

const crearArchivosSesion = async (sesionId, estudianteId, files) => {
  const payload = files.map((file) => ({
    sesion_id: sesionId,
    estudiante_id: estudianteId,
    nombre_original: file.originalname,
    nombre_archivo: file.filename,
    mime_type: file.mimetype,
    size_bytes: file.size,
    url_o_path: buildPublicPath(sesionId, file.filename),
  }));

  return archivo_sesion_estudio.bulkCreate(payload);
};

const listarArchivosSesion = async (sesionId) => {
  return archivo_sesion_estudio.findAll({
    where: { sesion_id: sesionId },
    include: [
      {
        model: estudiante,
        attributes: ["id", "nombre", "apellido"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

module.exports = {
  crearArchivosSesion,
  listarArchivosSesion,
};
