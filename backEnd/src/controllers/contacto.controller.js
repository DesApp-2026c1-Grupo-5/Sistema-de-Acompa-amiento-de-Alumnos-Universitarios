const { Op } = require("sequelize");
const { contacto, estudiante, usuario } = require("../db/models");
const { sendMail } = require("../services/mailer.service");
const { renderTemplate } = require("../services/emailRenderer.service");

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

  const contactosExistentes = await contacto.findAll({
    where: {
      [Op.or]: [
        { estudiante_solicitante_id: estudianteActual.id },
        { estudiante_receptor_id: estudianteActual.id },
      ],
    },
    attributes: ["estudiante_solicitante_id", "estudiante_receptor_id", "estado"],
  });

  const idsContactados = new Set();
  contactosExistentes.forEach((c) => {
    const otroId =
      c.estudiante_solicitante_id === estudianteActual.id
        ? c.estudiante_receptor_id
        : c.estudiante_solicitante_id;
    idsContactados.add(otroId);
  });

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
      solicitudEnviada: idsContactados.has(e.id),
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

  const receptor = await estudiante.findByPk(receptorId, {
    include: [{ model: usuario, attributes: ["email"] }],
  });

  if (receptor?.usuario?.email) {
    const nombreSolicitante = `${solicitante.nombre ?? ""} ${solicitante.apellido ?? ""}`.trim();
    const html = renderTemplate("contactInvitation", {
      titulo: "Nueva solicitud de conexión",
      nombre_receptor: receptor.nombre ?? "estudiante",
      nombre_solicitante: nombreSolicitante,
    });

    await sendMail({
      to: receptor.usuario.email,
      subject: `Solicitud de conexión de ${nombreSolicitante}`,
      html,
    });
  }

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