const sesionArchivoService = require("../services/sesionArchivo.service");

const toArchivoDto = (archivo) => {
  const plain = archivo.get ? archivo.get({ plain: true }) : archivo;

  return {
    id: plain.id,
    nombreOriginal: plain.nombre_original,
    nombreArchivo: plain.nombre_archivo,
    mimeType: plain.mime_type,
    sizeBytes: plain.size_bytes,
    url: plain.url_o_path,
    uploader: plain.estudiante
      ? {
          id: plain.estudiante.id,
          nombre: plain.estudiante.nombre,
          apellido: plain.estudiante.apellido,
        }
      : null,
    createdAt: plain.createdAt,
  };
};

const listarArchivosSesion = async (req, res) => {
  const archivos = await sesionArchivoService.listarArchivosSesion(req.sesion_estudio.id);

  return res.status(200).json({
    ok: true,
    data: archivos.map(toArchivoDto),
  });
};

const subirArchivosSesion = async (req, res) => {
  const archivos = await sesionArchivoService.crearArchivosSesion(
    req.sesion_estudio.id,
    req.estudiante.id,
    req.files
  );

  return res.status(201).json({
    ok: true,
    data: archivos.map(toArchivoDto),
  });
};

module.exports = {
  listarArchivosSesion,
  subirArchivosSesion,
};
