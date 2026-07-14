const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const ESTADO_TO_API = {
  Vigente: "vigente",
  Transición: "transicion",
  Discontinuado: "discontinuado",
};

const normalizeCorrelativa = (correlativa) => {
  const codigo = typeof correlativa === "string" ? correlativa : correlativa?.codigo;
  if (!codigo) return null;
  return {
    codigo,
    tipo: correlativa?.tipo === "aprobar" ? "aprobar" : "cursar",
  };
};

const normalizeCorrelativas = (correlativas = []) =>
  correlativas.map(normalizeCorrelativa).filter(Boolean);

export const mapPlanEstudioFromApi = (p) => ({
  id: p.id,
  careerId: p.carrera_id,
  careerName: p.carrera_nombre ?? "",
  planYear: p.anio,
  status: capitalize(p.estado),
  conditions: {
    englishRequired:
      p.niveles_ingles_requeridos != null
        ? `Nivel ${p.niveles_ingles_requeridos}`
        : "Sin requisito",
    englishLevel: p.niveles_ingles_requeridos ?? 0,
    englishCertification: "",
    electiveCredits: p.creditos_requeridos ?? 0,
    electiveLabel: "Créditos requeridos",
    unahurSubjects: p.materias_unahur ?? 0,
    unahurLabel: "Materias UNAHUR",
  },
  subjects: (p.materias ?? []).map((m) => ({
    id: m.id,
    code: m.codigo ?? "",
    name: m.nombre ?? "",
    year: m.anio_cursada ?? 1,
    semester: m.modalidad ?? "Cuatrimestral",
    type: m.es_optativa ? "Optativa" : "Obligatoria",
    esUnahur: m.es_unahur ?? false,
    correlatives: normalizeCorrelativas(m.correlativas),
    credits: m.creditos_otorga ?? 0,
  })),
});

export const mapPlanEstudioToApi = (plan) => ({
  estado: ESTADO_TO_API[plan.status] ?? "vigente",
  creditos_requeridos: plan.conditions.electiveCredits ?? 0,
  niveles_ingles_requeridos: plan.conditions.englishLevel ?? 0,
  materias_unahur: plan.conditions.unahurSubjects ?? 0,
  materias: (plan.subjects ?? []).map((s) => ({
    id: s.id,
    codigo: s.code,
    nombre: s.name,
    anio_cursada: s.year,
    modalidad: s.semester,
    es_optativa: s.type === "Optativa",
    es_unahur: s.esUnahur ?? false,
    creditos_otorga: s.credits ?? 0,
    correlativas: normalizeCorrelativas(s.correlatives),
  })),
});
