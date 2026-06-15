const { Op } = require("sequelize");
const { contacto, estudiante, usuario } = require("../db/models");

const aceptarInvitacion = async (req, res) => {
  await req.contacto.update({
    estado: "aceptado",
    fecha_respuesta: new Date(),
  });

  res.json({ ok: true, message: "Invitación aceptada exitosamente" });
};

const ignorarInvitacion = async (req, res) => {
  await req.contacto.update({
    estado: "rechazado",
    fecha_respuesta: new Date(),
  });

  res.json({ ok: true, message: "Invitación ignorada exitosamente" });
};

const buscarUsuarios = async (req, res) => {
  const { q = "" } = req.query;
  const estudianteActual = req.estudiante;

  const texto = q.trim().toLowerCase();

  const estudiantes = await estudiante.findAll({
    include: [
      {
        model: usuario,
        attributes: ["email"],
      },
    ],
    limit: 50,
  });

  const resultado = estudiantes
    .filter((e) => e.id !== estudianteActual.id)
    .filter((e) => {
      if (!texto) return true;

      const nombreCompleto = `${e.nombre ?? ""} ${e.apellido ?? ""}`.toLowerCase();
      const nombre = `${e.nombre ?? ""}`.toLowerCase();
      const apellido = `${e.apellido ?? ""}`.toLowerCase();
      const email = `${e.usuario?.email ?? ""}`.toLowerCase();

      return (
        nombreCompleto.includes(texto) ||
        nombre.includes(texto) ||
        apellido.includes(texto) ||
        email.includes(texto)
      );
    })
    .slice(0, 20)
    .map((e) => ({
      id: e.id,
      name: `${e.nombre ?? ""} ${e.apellido ?? ""}`.trim(),
      initials: `${e.nombre?.[0] ?? ""}${e.apellido?.[0] ?? ""}`.toUpperCase(),
      foto_url: e.foto_url,
      career: "",
      email: e.usuario?.email,
      solicitudEnviada: false,
    }));

  res.json(resultado);
};

const enviarInvitacion = async (req, res) => {
  const receptorId = Number(req.params.estudianteId);

  const solicitante = req.estudiante;

  if (solicitante.id === receptorId) {
    return res.status(400).json({
      ok: false,
      message: "No puedes enviarte una solicitud a ti mismo",
    });
  }

  const existente = await contacto.findOne({
    where: {
      estudiante_solicitante_id: solicitante.id,
      estudiante_receptor_id: receptorId,
    },
  });

  if (existente) {
    return res.status(400).json({
      ok: false,
      message: "La solicitud ya existe",
    });
  }

  await contacto.create({
    estudiante_solicitante_id: solicitante.id,
    estudiante_receptor_id: receptorId,
    estado: "pendiente",
    fecha_solicitud: new Date(),
  });

  res.json({
    ok: true,
    message: "Solicitud enviada",
  });
};

module.exports = {
  aceptarInvitacion,
  ignorarInvitacion,
  buscarUsuarios,
  enviarInvitacion,
};