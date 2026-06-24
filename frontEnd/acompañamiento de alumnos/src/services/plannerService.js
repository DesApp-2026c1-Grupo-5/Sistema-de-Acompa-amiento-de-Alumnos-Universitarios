import { api } from "./api";

export async function getCareerSubjects() {
  try {
    const res = await api.get("/student/academic-assistant/plan-subjects");

    const subjects = res?.data?.subjects ?? [];
    const currentPlan = res?.data?.currentPlan ?? [];

    return {
      subjects: subjects.map((s) => ({
        ...s,
        hours: s.hours || 6,
        cuatrimestre: s.cuatrimestre || (s.year % 2 === 0 ? 2 : 1),
      })),
      currentPlan,
      materiasNombres: res?.data?.materiasNombres ?? {},
      summary: res?.data?.summary ?? null,
    };
  } catch {
    return {
      subjects: [],
      currentPlan: [],
      materiasNombres: {},
      summary: null,
    };
  }
}
