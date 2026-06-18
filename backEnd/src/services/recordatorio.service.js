const cron = require("node-cron");
const { Op } = require("sequelize");
const {
  inscripcion_sesion,
  sesion_estudio,
  estudiante: Estudiante,
  usuario,
  estado_materia,
  materia,
  situacion_academica,
} = require("../db/models");
const { crearNotificacion, crearNotificacionUnica } = require("./notificacion.service");
const { sendMail } = require("./mailer.service");

const ESTADOS_ACTIVOS = ["aprobada", "inscripto"];
const DIAS_AVISO_REGULARIDAD = 30;

const formatearFecha = (fecha) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);

const sumarAnios = (fecha, anios) => {
  const copia = new Date(fecha);
  copia.setFullYear(copia.getFullYear() + anios);
  return copia;
};

const notificarConCorreo = async ({
  usuarioId,
  email,
  titulo,
  mensaje,
  html,
  referenciaTipo,
  referenciaId,
  tipo,
  actionUrl,
}) => {
  const resultado = await crearNotificacionUnica({
    usuario_id: usuarioId,
    titulo,
    tipo,
    mensaje,
    referencia_tipo: referenciaTipo,
    referencia_id: referenciaId,
    action_url: actionUrl,
  });

  if (email && resultado.creada) {
    await sendMail({
      to: email,
      subject: titulo,
      html,
    });
  }
};

const verificarRegularidades = async () => {
  const ahora = new Date();

  const estados = await estado_materia.findAll({
    where: { estado: "regularizada" },
    include: [
      {
        model: materia,
        attributes: ["id", "nombre"],
      },
      {
        model: situacion_academica,
        include: [
          {
            model: Estudiante,
            include: [{ model: usuario, attributes: ["email"] }],
          },
        ],
      },
    ],
  });

  for (const estado of estados) {
    const base = estado.fecha ?? estado.createdAt;
    if (!base) continue;

    const vence = sumarAnios(base, 2);
    const diasRestantes = Math.ceil((vence.getTime() - ahora.getTime()) / (24 * 60 * 60 * 1000));
    if (diasRestantes > DIAS_AVISO_REGULARIDAD) continue;

    const estudiante = estado.situacion_academica?.estudiante;
    if (!estudiante?.usuario_id) continue;

    const materiaNombre = estado.materium?.nombre ?? estado.materia?.nombre ?? "materia";
    const fechaVencimiento = formatearFecha(vence);
    const vencida = diasRestantes < 0;

    await notificarConCorreo({
      usuarioId: estudiante.usuario_id,
      email: estudiante.usuario?.email ?? null,
      titulo: vencida ? "Regularidad vencida" : "Regularidad próxima a vencer",
      mensaje: vencida
        ? `La regularidad de ${materiaNombre} venció el ${fechaVencimiento}.`
        : `La regularidad de ${materiaNombre} vence el ${fechaVencimiento}.`,
      html: vencida
        ? `<p>La regularidad de <strong>${materiaNombre}</strong> venció el ${fechaVencimiento}.</p><p>Revisá tu situación académica.</p>`
        : `<p>La regularidad de <strong>${materiaNombre}</strong> vence el ${fechaVencimiento}.</p><p>Revisá tu situación académica.</p>`,
      referenciaTipo: "estado_materia",
      referenciaId: estado.id,
      tipo: "academic",
      actionUrl: "/student/academic-status",
    });
  }
};

const verificarSesionesFinalizadas = async () => {
  const ahora = new Date();

  const sesiones = await sesion_estudio.findAll({
    where: { cancelada: false },
    include: [
      {
        model: Estudiante,
        as: "creador",
        include: [{ model: usuario, attributes: ["email"] }],
      },
      {
        model: inscripcion_sesion,
        attributes: ["estado"],
        where: { estado: ESTADOS_ACTIVOS },
        required: false,
        include: [
          {
            model: Estudiante,
            include: [{ model: usuario, attributes: ["email"] }],
          },
        ],
      },
    ],
  });

  for (const sesion of sesiones) {
    const inicio = new Date(sesion.fecha_hora).getTime();
    const duracion = (sesion.duracion_minutos || 0) * 60 * 1000;
    const fin = inicio + duracion;

    if (Number.isNaN(inicio) || ahora.getTime() < fin) continue;

    const usuariosDestinatarios = [
      {
        usuarioId: sesion.creador?.usuario_id,
        email: sesion.creador?.usuario?.email ?? null,
      },
      ...(sesion.inscripcion_sesions || []).map((inscripcion) => ({
        usuarioId: inscripcion.estudiante?.usuario_id,
        email: inscripcion.estudiante?.usuario?.email ?? null,
      })),
    ].filter((item) => item.usuarioId);

    for (const destinatario of usuariosDestinatarios) {
      await notificarConCorreo({
        usuarioId: destinatario.usuarioId,
        email: destinatario.email,
        titulo: "Sesión finalizada",
        mensaje: `La sesión "${sesion.tema}" finalizó.`,
        html: `<p>La sesión <strong>"${sesion.tema}"</strong> finalizó.</p><p>Podés revisar tus sesiones desde la app.</p>`,
        referenciaTipo: "sesion_estudio",
        referenciaId: sesion.id,
        tipo: "session",
        actionUrl: "/student/study-sessions",
      });
    }
  }
};

const verificarYEnviarRecordatorios = async () => {
  const ahora = new Date();
  const dentroDe24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

  const sesionesProximas = await sesion_estudio.findAll({
    where: {
      cancelada: false,
      fecha_hora: {
        [Op.between]: [ahora, dentroDe24h],
      },
    },
  });

  if (sesionesProximas.length > 0) {
    const sesionIds = sesionesProximas.map((s) => s.id);
    const sesionMap = {};
    for (const s of sesionesProximas) {
      sesionMap[s.id] = s;
    }

    const inscripciones = await inscripcion_sesion.findAll({
      where: {
        sesion_id: sesionIds,
        notificado_recordatorio: false,
        estado: ESTADOS_ACTIVOS,
      },
      include: [
        {
          model: Estudiante,
          required: true,
          include: [{ model: usuario, attributes: ["email"] }],
        },
      ],
    });

    for (const insc of inscripciones) {
      const sesion = sesionMap[insc.sesion_id];
      if (!sesion) continue;

      const participante = insc.estudiante;
      if (!participante) continue;

      const emailEstudiante = participante.usuario?.email;

      await crearNotificacion({
        usuario_id: participante.usuario_id,
        titulo: "Recordatorio de sesión de estudio",
        tipo: "session",
        mensaje: `La sesión "${sesion.tema}" comienza en menos de 24 horas. No te pierdas este encuentro.`,
        referencia_tipo: "sesion_estudio",
        referencia_id: sesion.id,
        action_url: "/student/study-sessions",
      });

      if (emailEstudiante) {
        await sendMail({
          to: emailEstudiante,
          subject: `Recordatorio: "${sesion.tema}" comienza pronto`,
          html: `<p>Hola ${participante.nombre},</p>
                 <p>Te recordamos que la sesión <strong>"${sesion.tema}"</strong> comienza en menos de 24 horas.</p>
                 <p>No olvides conectarte a tiempo.</p>
                 <p>Saludos,<br/>El equipo de SIVA</p>`,
        });
      }

      await insc.update({ notificado_recordatorio: true });
    }
  }

  await verificarRegularidades();
  await verificarSesionesFinalizadas();
};

const iniciarRecordatorios = () => {
  cron.schedule("0 * * * *", () => {
    verificarYEnviarRecordatorios().catch((error) => {
      console.error("[recordatorio] Error en verificarYEnviarRecordatorios:", error.message);
    });
  });
  console.log(" Cron de recordatorios iniciado");
};

module.exports = { iniciarRecordatorios };
