const ESTADOS_APROBADOS = new Set([
  "aprobada",
  "aprobado",
  "promocionada",
  "promotionada",
]);
const ESTADOS_REGULARES = new Set(["regular", "regularizada", "regularizado"]);
const ESTADOS_CURSANDO = new Set(["cursando"]);

const normalizarEstadoMateria = (estado) => {
  const value = String(estado || "pendiente").trim().toLowerCase();
  if (ESTADOS_APROBADOS.has(value)) return "aprobada";
  if (ESTADOS_REGULARES.has(value)) return "regular";
  if (ESTADOS_CURSANDO.has(value)) return "cursando";
  return "pendiente";
};

const estadosAceptadosPara = (tipo) => {
  if (tipo === "cursar") return ["regular", "aprobada"];
  if (tipo === "aprobar") return ["aprobada"];
  return [];
};

const cumpleCorrelatividad = (tipo, estadoRequisito) =>
  estadosAceptadosPara(tipo).includes(normalizarEstadoMateria(estadoRequisito));

const obtenerIncumplimientos = (materias, estadoPorMateria) => {
  const incumplimientos = [];

  for (const materia of materias) {
    const estadoMateria = normalizarEstadoMateria(estadoPorMateria.get(Number(materia.id)));
    if (estadoMateria === "pendiente") continue;

    for (const correlativa of materia.correlatividades || []) {
      const tipo = String(correlativa.tipo || "").trim().toLowerCase();
      const requisitoId = Number(correlativa.materia_requisito_id);
      const estadoRequisito = normalizarEstadoMateria(estadoPorMateria.get(requisitoId));

      if (cumpleCorrelatividad(tipo, estadoRequisito)) continue;

      incumplimientos.push({
        materia_id: Number(materia.id),
        materia: materia.nombre,
        estado_proyectado: estadoMateria,
        materia_requisito_id: requisitoId,
        requisito: correlativa.requisito?.nombre || null,
        requisito_codigo: correlativa.requisito?.codigo || null,
        tipo,
        estado_requisito_proyectado: estadoRequisito,
        estados_aceptados: estadosAceptadosPara(tipo),
      });
    }
  }

  return incumplimientos;
};

module.exports = {
  cumpleCorrelatividad,
  estadosAceptadosPara,
  normalizarEstadoMateria,
  obtenerIncumplimientos,
};
