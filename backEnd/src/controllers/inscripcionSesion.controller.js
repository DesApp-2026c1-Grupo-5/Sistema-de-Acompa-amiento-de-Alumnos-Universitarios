const inscripcionSesionService = require("../services/inscripcionSesion.service");

const inscribirse = async (req, res, next) => {
  if (!req.params.id) {
    const error = new Error("id de sesion requerido");
    error.statusCode = 400;
    return next(error);
  }

  const inscripcion = await inscripcionSesionService.inscribirse(req.params.id, req.user.sub);

  return res.status(201).json({
    ok: true,
    data: inscripcion,
  });
};

const inscribirseLegacy = async (req, res, next) => {
  req.params.id = req.body.sesion_id;
  return inscribirse(req, res, next);
};

const cancelarMiInscripcion = async (req, res, next) => {
  const data = await inscripcionSesionService.cancelarMiInscripcion(req.params.id, req.user.sub);

  return res.status(200).json({
    ok: true,
    data,
  });
};

const aprobarParticipante = async (req, res, next) => {
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

const rechazarParticipante = async (req, res, next) => {
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
  inscribirseLegacy,
  cancelarMiInscripcion,
  aprobarParticipante,
  rechazarParticipante,
};
