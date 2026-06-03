const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

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
    englishCertification: "",
    electiveCredits: p.creditos_requeridos ?? 0,
    electiveLabel: "Créditos requeridos",
    unahurSubjects: p.materias_unahur ?? 0,
    unahurLabel: "Materias UNAHUR",
  },
  subjects: (p.materias ?? []).map((m) => ({
    code: m.codigo ?? "",
    name: m.nombre ?? "",
    year: m.anio_cursada ?? 1,
    semester: m.modalidad ?? "Cuatrimestral",
    type: m.es_optativa ? "Optativa" : "Obligatoria",
    correlatives: m.correlativas ?? [],
    credits: m.creditos_otorga ?? 0,
  })),
});
