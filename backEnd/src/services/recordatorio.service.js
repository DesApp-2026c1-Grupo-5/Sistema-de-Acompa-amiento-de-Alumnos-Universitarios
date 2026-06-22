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
const { renderTemplate } = require("./emailRenderer.service");
const logger = require("../utils/logger");

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

    const titulo = vencida ? "Regularidad vencida" : "Regularidad próxima a vencer";
    const mensaje = vencida
      ? `La regularidad de ${materiaNombre} venció el ${fechaVencimiento}.`
      : `La regularidad de ${materiaNombre} vence el ${fechaVencimiento}.`;

    await crearNotificacionUnica({
      usuario_id: estudiante.usuario_id,
      titulo,
      tipo: "academic",
      mensaje,
      referencia_tipo: "estado_materia",
      referencia_id: estado.id,
      action_url: "/student/academic-status",
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
      await crearNotificacionUnica({
        usuario_id: destinatario.usuarioId,
        titulo: "Sesión finalizada",
        tipo: "session",
        mensaje: `La sesión "${sesion.tema}" finalizó.`,
        referencia_tipo: "sesion_estudio",
        referencia_id: sesion.id,
        action_url: "/student/study-sessions",
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
        const variables = {
          titulo: `Recordatorio: "${sesion.tema}" comienza pronto`,
          nombre: participante.nombre ?? "",
          tema: sesion.tema ?? "",
          fecha_hora: sesion.fecha_hora ? new Date(sesion.fecha_hora).toLocaleString("es-AR") : "",
          duracion_minutos: sesion.duracion_minutos ?? "",
          tipo: sesion.tipo ?? "",
          link_ubicacion: sesion.link_ubicacion ?? "",
        };

        await sendMail({
          to: emailEstudiante,
          subject: `Recordatorio: "${sesion.tema}" comienza pronto`,
          html: renderTemplate("sessionReminder", variables),
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
      logger.error("recordatorio", "Error en verificarYEnviarRecordatorios", { error: error.message });
    });
  });
  logger.info("recordatorio", "Cron de recordatorios iniciado");
};

module.exports = { iniciarRecordatorios };
