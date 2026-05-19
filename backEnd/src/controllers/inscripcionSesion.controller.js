const inscripcionSesionService = require("../services/inscripcionSesion.service");

const inscribirse = async (req, res, next) => {
  try {
    const inscripcion = await inscripcionSesionService.inscribirse(req.params.id, req.user.sub);

    return res.status(201).json({
      ok: true,
      data: inscripcion,
    });
  } catch (error) {
    return next(error);
  }
};

const inscribirseLegacy = async (req, res, next) => {
  try {
    req.params.id = req.body.sesion_id;
    return await inscribirse(req, res, next);
  } catch (error) {
    return next(error);
  }
};

const cancelarMiInscripcion = async (req, res, next) => {
  try {
    const data = await inscripcionSesionService.cancelarMiInscripcion(req.params.id, req.user.sub);

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const aprobarParticipante = async (req, res, next) => {
  try {
    const data = await inscripcionSesionService.aprobarParticipante(
      req.params.id,
      req.params.inscripcionId,
      req.user.sub
    );

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const rechazarParticipante = async (req, res, next) => {
  try {
    const data = await inscripcionSesionService.rechazarParticipante(
      req.params.id,
      req.params.inscripcionId,
      req.user.sub
    );

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  inscribirse,
  inscribirseLegacy,
  cancelarMiInscripcion,
  aprobarParticipante,
  rechazarParticipante,
};
