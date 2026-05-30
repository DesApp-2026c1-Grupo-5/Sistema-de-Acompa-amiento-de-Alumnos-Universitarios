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

module.exports = {
  aceptarInvitacion,
  ignorarInvitacion,
};
