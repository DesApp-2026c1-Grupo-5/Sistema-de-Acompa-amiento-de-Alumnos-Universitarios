const cron = require("node-cron");
const { Op } = require("sequelize");
const {
  inscripcion_sesion,
  sesion_estudio,
  estudiante: Estudiante,
  usuario,
} = require("../db/models");
const { crearNotificacion } = require("./notificacion.service");
const { sendMail } = require("./mailer.service");

const ESTADOS_ACTIVOS = ["aprobada", "inscripto"];

const verificarYEnviarRecordatorios = async () => {
  try {
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

    if (sesionesProximas.length === 0) return;

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
  } catch (error) {
    console.error("[recordatorio] Error en verificarYEnviarRecordatorios:", error.message);
  }
};

const iniciarRecordatorios = () => {
  cron.schedule("0 * * * *", () => {
    verificarYEnviarRecordatorios();
  });
  console.log(" Cron de recordatorios iniciado");
};

module.exports = { iniciarRecordatorios };
