import { api } from "./api";

export async function getCareerSubjects() {
  try {
    const res = await api.get("/student/academic-assistant/plan-subjects");
    if (res?.data?.subjects) {
      return {
        subjects: res.data.subjects.map((s) => ({
          ...s,
          hours: s.hours || 6,
          cuatrimestre: s.cuatrimestre || (s.year % 2 === 0 ? 2 : 1),
        })),
      };
    }
    return { subjects: [] };
  } catch {
    return { subjects: [] };
  }
}
