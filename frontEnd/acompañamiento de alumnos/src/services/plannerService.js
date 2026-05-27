import subjectsData from '../pages/student/academicAssistant/subjects.json';

const lightHours = (name) =>
  /ingl.s|optativa|unahur|pr.ctica profesional/i.test(name) ? 4 : 6;

function assignCuatrimestre(subjects) {
  const byYear = {};
  subjects.forEach((s) => {
    if (!byYear[s.year]) byYear[s.year] = [];
    byYear[s.year].push(s);
  });

  const enriched = [];
  for (const year of Object.keys(byYear).sort()) {
    const list = byYear[year];
    list.forEach((s, i) => {
      const half = Math.ceil(list.length / 2);
      enriched.push({
        ...s,
        cuatrimestre: i < half ? 1 : 2,
        hours: lightHours(s.name),
      });
    });
  }
  return enriched;
}

export async function getCareerSubjects() {
  const enriched = assignCuatrimestre(subjectsData.subjects);
  return {
    career: subjectsData.career,
    plan: subjectsData.plan,
    subjects: enriched,
  };
}
