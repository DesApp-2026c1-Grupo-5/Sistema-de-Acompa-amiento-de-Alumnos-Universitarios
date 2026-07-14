import { api } from "./api";

export async function getCareerSubjects() {
  const res = await api.get("/student/academic-assistant/plan-subjects");
  const mapSubject = (subject) => ({
    ...subject,
    id: Number(subject.id),
    correlatives: (subject.correlatives ?? []).map(Number),
    correlativeRequirements: (subject.correlativeRequirements ?? []).map((requirement) => ({
      ...requirement,
      subjectId: Number(requirement.subjectId),
    })),
    hours: subject.hours || 6,
    cuatrimestre:
      subject.cuatrimestre || (subject.year % 2 === 0 ? 2 : 1),
  });

  const subjects = res?.data?.subjects ?? [];
  const simulatorSubjects = res?.data?.simulatorSubjects ?? [];
  const currentPlan = res?.data?.currentPlan ?? [];

  return {
    subjects: subjects.map(mapSubject),
    simulatorSubjects: simulatorSubjects.map(mapSubject),
    currentPlan,
    planningBlocked: !!res?.data?.planningBlocked,
    unplannableSubjects: (res?.data?.unplannableSubjects ?? []).map((subject) => ({
      ...subject,
      id: Number(subject.id),
      reasons: subject.reasons ?? [],
    })),
    materiasNombres: res?.data?.materiasNombres ?? {},
    summary: res?.data?.summary ?? null,
  };
}
