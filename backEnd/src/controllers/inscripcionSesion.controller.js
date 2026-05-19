const inscripcionSesionService = require("../services/inscripcionSesion.service");

const inscribirse = async (req, res) => {
  const inscripcion = await inscripcionSesionService.inscribirse(req.params.id, req.user.sub);

  return res.status(201).json({
    ok: true,
    data: inscripcion,
  });
};

const cancelarMiInscripcion = async (req, res) => {
  const data = await inscripcionSesionService.cancelarMiInscripcion(req.params.id, req.user.sub);

  return res.status(200).json({
    ok: true,
    data,
  });
};

const aprobarParticipante = async (req, res) => {
  const data = await inscripcionSesionService.aprobarParticipante(
    req.params.id,
    req.params.inscripcionId,
    req.user.sub
  );

  return res.status(200).json({
    ok: true,
    data,
  });
};

const rechazarParticipante = async (req, res) => {
  const data = await inscripcionSesionService.rechazarParticipante(
    req.params.id,
    req.params.inscripcionId,
    req.user.sub
  );

  return res.status(200).json({
    ok: true,
    data,
  });
};

module.exports = {
  inscribirse,
  cancelarMiInscripcion,
  aprobarParticipante,
  rechazarParticipante,
};
