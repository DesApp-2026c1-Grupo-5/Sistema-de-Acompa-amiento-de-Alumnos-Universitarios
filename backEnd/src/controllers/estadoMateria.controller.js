const { registrarAccionAcademica } = require("../services/publicacionAcademica.service");

const crearHandler = (accion) => async (req, res) => {
  const data = await registrarAccionAcademica(
    req.user.sub,
    Number(req.params.id),
    accion,
    req.body
  );

  return res.status(201).json({
    ok: true,
    data,
  });
};

module.exports = {
  inscribirMateria: crearHandler("inscripcion"),
  regularizarMateria: crearHandler("regularizacion"),
  aprobarMateria: crearHandler("aprobacion"),
};
