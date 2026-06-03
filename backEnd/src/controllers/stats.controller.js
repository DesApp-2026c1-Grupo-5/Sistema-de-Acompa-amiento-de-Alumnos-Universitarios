const { Op, fn, col } = require("sequelize");
const db = require("../db/models");

const {
  usuario,
  estudiante,
  material,
  sesion_estudio,
  inscripcion_sesion,
  denuncia,
  estado_materia,
  situacion_academica,
  carrera,
  plan_estudio,
  materia,
  contacto,
  post,
  valoracion,
  voto_post,
} = db;

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const countBuckets = (values, buckets) => {
  const counts = buckets.map(() => 0);
  for (const v of values) {
    for (let i = 0; i < buckets.length; i += 1) {
      const [min, max] = buckets[i].range;
      if (v >= min && (max === null || v <= max)) {
        counts[i] += 1;
        break;
      }
    }
  }
  return counts;
};

const bucketize = (values, buckets, fieldName = "students") => {
  const counts = countBuckets(values, buckets);
  const total = counts.reduce((s, c) => s + c, 0);
  return buckets.map((b, i) => ({
    label: b.label,
    [fieldName]: counts[i],
    percentage: total > 0 ? Math.round((counts[i] / total) * 100) : 0,
  }));
};

const lastNMonths = (n) => {
  const result = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const inicio = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
    const fin = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    result.push({ label: MONTHS[inicio.getMonth()], inicio, fin });
  }
  return result;
};

const buildMetricasUso = ({
  usuariosActivos,
  materialesCompartidos,
  sesionesCreadas,
  denunciasPendientes,
}) => [
  { id: 1, label: "Usuarios activos",       value: usuariosActivos,       trend: null, trendType: null, icon: "users" },
  { id: 2, label: "Materiales compartidos", value: materialesCompartidos, trend: null, trendType: null, icon: "file" },
  { id: 3, label: "Sesiones creadas",       value: sesionesCreadas,       trend: null, trendType: null, icon: "calendar" },
  { id: 4, label: "Denuncias pendientes",   value: denunciasPendientes,   trend: null, trendType: null, icon: "flag" },
];

const buildMetricasSociales = ({
  conexionesPromedio,
  sesionesActivas,
  participantesTotales,
  tasaOcupacion,
}) => [
  { id: 1, label: "Conexiones promedio",   value: conexionesPromedio,         trend: null, trendType: null, icon: "link" },
  { id: 2, label: "Sesiones activas",      value: sesionesActivas,            trend: null, trendType: null, icon: "calendar" },
  { id: 3, label: "Participantes totales", value: participantesTotales,       trend: null, trendType: null, icon: "users" },
  { id: 4, label: "Tasa de ocupación",     value: `${tasaOcupacion}%`,        trend: null, trendType: null, icon: "chart" },
];

const computeMateriasPorCarrera = async () => {
  const carreras = await carrera.findAll({
    include: [
      {
        model: plan_estudio,
        as: "planes",
        attributes: ["id"],
        include: [
          {
            model: materia,
            as: "materias",
            attributes: ["id"],
            include: [
              {
                model: estado_materia,
                attributes: ["estado"],
              },
            ],
          },
        ],
      },
    ],
  });

  return carreras.map((c) => {
    const plain = c.get({ plain: true });
    let cursadas = 0;
    let aprobadas = 0;
    for (const plan of plain.planes || []) {
      for (const mat of plan.materias || []) {
        for (const em of mat.estado_materias || []) {
          if (em.estado === "cursando") cursadas += 1;
          if (em.estado === "aprobada") aprobadas += 1;
        }
      }
    }
    return { career: plain.nombre, cursadas, aprobadas };
  });
};

const computeTopMaterias = async () => {
  const rows = await material.findAll({
    attributes: [
      "materia_id",
      [fn("COUNT", col("id")), "cantidad"],
    ],
    group: ["materia_id"],
    raw: true,
  });

  const ordenadas = rows
    .map((r) => ({ materia_id: r.materia_id, cantidad: Number(r.cantidad) }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  if (ordenadas.length === 0) return [];

  const materiaIds = ordenadas.map((r) => r.materia_id);
  const materias = await materia.findAll({
    where: { id: { [Op.in]: materiaIds } },
    attributes: ["id", "nombre"],
    raw: true,
  });
  const materiasMap = new Map(materias.map((m) => [m.id, m.nombre]));

  const valoraciones = await valoracion.findAll({
    attributes: ["valor"],
    include: [
      {
        model: material,
        attributes: ["materia_id"],
        where: { materia_id: { [Op.in]: materiaIds } },
      },
    ],
    raw: true,
    nest: true,
  });

  const ratingPorMateria = new Map();
  for (const v of valoraciones) {
    const mid = v.material?.materia_id;
    if (!mid) continue;
    const entry = ratingPorMateria.get(mid) || { likes: 0, total: 0 };
    entry.total += 1;
    if (v.valor === "like") entry.likes += 1;
    ratingPorMateria.set(mid, entry);
  }

  return ordenadas.map((r, idx) => {
    const stats = ratingPorMateria.get(r.materia_id);
    const rating = stats && stats.total > 0
      ? Math.round((stats.likes / stats.total) * 5 * 10) / 10
      : 0;
    return {
      position: idx + 1,
      subject: materiasMap.get(r.materia_id) || `Materia ${r.materia_id}`,
      materials: r.cantidad,
      rating,
    };
  });
};

const computeDistribucionMaterias = async (estadoBuscado, bucketDefs) => {
  const situaciones = await situacion_academica.findAll({
    attributes: ["id"],
    include: [
      {
        model: estado_materia,
        attributes: ["estado"],
        where: { estado: estadoBuscado },
        required: false,
      },
    ],
  });

  const conteos = situaciones.map((s) => {
    const plain = s.get({ plain: true });
    return (plain.estado_materias || []).length;
  });

  return bucketize(conteos, bucketDefs);
};

const computeParticipantesPorSesion = async () => {
  const sesiones = await sesion_estudio.findAll({
    attributes: ["id"],
    include: [
      {
        model: inscripcion_sesion,
        attributes: ["estado"],
        where: { estado: "aceptada" },
        required: false,
      },
    ],
  });

  const conteos = sesiones.map((s) => {
    const plain = s.get({ plain: true });
    return (plain.inscripcion_sesions || []).length;
  });

  return bucketize(
    conteos,
    [
      { label: "1-3 participantes",  range: [1, 3] },
      { label: "4-6 participantes",  range: [4, 6] },
      { label: "7-10 participantes", range: [7, 10] },
      { label: "11+ participantes",  range: [11, null] },
    ],
    "sessions"
  );
};

const computeUsuariosActivosSerie = async () => {
  const meses = lastNMonths(12);
  return Promise.all(
    meses.map(async (m) => {
      const rows = await post.findAll({
        attributes: ["estudiante_id"],
        where: { createdAt: { [Op.between]: [m.inicio, m.fin] } },
        group: ["estudiante_id"],
        raw: true,
      });
      return { month: m.label, value: rows.length };
    })
  );
};

const computeSesionesPorMes = async () => {
  const meses = lastNMonths(12);
  const counts = await Promise.all(
    meses.map((m) =>
      sesion_estudio.count({
        where: { fecha_hora: { [Op.between]: [m.inicio, m.fin] } },
      })
    )
  );
  return { months: meses.map((m) => m.label), data: counts };
};

const computeDistribucionConexionesData = async () => {
  const estudiantes = await estudiante.findAll({ attributes: ["id"], raw: true });
  if (estudiantes.length === 0) {
    return [
      { label: "0-5",   students: 0, percentage: 0 },
      { label: "6-10",  students: 0, percentage: 0 },
      { label: "11-15", students: 0, percentage: 0 },
      { label: "16-20", students: 0, percentage: 0 },
      { label: "21+",   students: 0, percentage: 0 },
    ];
  }
  const conteos = await Promise.all(
    estudiantes.map((e) =>
      contacto.count({
        where: {
          estado: "aceptado",
          [Op.or]: [
            { estudiante_solicitante_id: e.id },
            { estudiante_receptor_id: e.id },
          ],
        },
      })
    )
  );
  return bucketize(conteos, [
    { label: "0-5",   range: [0, 5] },
    { label: "6-10",  range: [6, 10] },
    { label: "11-15", range: [11, 15] },
    { label: "16-20", range: [16, 20] },
    { label: "21+",   range: [21, null] },
  ]);
};

const computeOcupacion = async () => {
  const sesiones = await sesion_estudio.findAll({
    attributes: ["id", "cupos_max"],
    include: [
      {
        model: inscripcion_sesion,
        attributes: ["estado"],
        where: { estado: "aceptada" },
        required: false,
      },
    ],
  });

  let cuposLlenos = 0;
  let conDisponibilidad = 0;
  let totalAceptadas = 0;
  let totalCupos = 0;

  for (const s of sesiones) {
    const plain = s.get({ plain: true });
    const aceptadas = (plain.inscripcion_sesions || []).length;
    const cupos = plain.cupos_max || 0;
    totalAceptadas += aceptadas;
    totalCupos += cupos;
    if (cupos > 0 && aceptadas >= cupos) cuposLlenos += 1;
    else conDisponibilidad += 1;
  }

  const percentage = totalCupos > 0
    ? Math.round((totalAceptadas / totalCupos) * 100)
    : 0;

  return { percentage, cuposLlenos, conDisponibilidad, totalAceptadas, totalCupos };
};

const computeCarrerasActivas = async () => {
  const carreras = await carrera.findAll({
    attributes: ["id", "nombre"],
    include: [
      {
        model: plan_estudio,
        as: "planes",
        attributes: ["id"],
        include: [
          {
            model: situacion_academica,
            attributes: ["estudiante_id"],
          },
        ],
      },
    ],
  });

  const filas = await Promise.all(
    carreras.map(async (c) => {
      const plain = c.get({ plain: true });
      const estudianteIds = new Set();
      for (const plan of plain.planes || []) {
        for (const sit of plan.situacion_academicas || []) {
          if (sit.estudiante_id) estudianteIds.add(sit.estudiante_id);
        }
      }
      const ids = Array.from(estudianteIds);
      if (ids.length === 0) {
        return { career: plain.nombre, posts: 0, sessions: 0, interactions: 0, _raw: 0 };
      }
      const [posts, sessions, valoraciones, votos] = await Promise.all([
        post.count({ where: { estudiante_id: { [Op.in]: ids } } }),
        sesion_estudio.count({ where: { creador_id: { [Op.in]: ids } } }),
        valoracion.count({ where: { estudiante_id: { [Op.in]: ids } } }),
        voto_post.count({ where: { estudiante_id: { [Op.in]: ids } } }),
      ]);
      const interactions = valoraciones + votos;
      const raw = posts + sessions * 3 + interactions;
      return { career: plain.nombre, posts, sessions, interactions, _raw: raw };
    })
  );

  const maxRaw = Math.max(1, ...filas.map((f) => f._raw));
  return filas
    .sort((a, b) => b._raw - a._raw)
    .map((f, idx) => ({
      position: idx + 1,
      career: f.career,
      posts: f.posts,
      sessions: f.sessions,
      interactions: f.interactions,
      score: Math.round((f._raw / maxRaw) * 100),
    }));
};

const computeConexionesPromedio = async () => {
  const [aceptados, totalEstudiantes] = await Promise.all([
    contacto.count({ where: { estado: "aceptado" } }),
    estudiante.count(),
  ]);
  if (totalEstudiantes === 0) return "0.0";
  const promedio = (aceptados * 2) / totalEstudiantes;
  return promedio.toFixed(1);
};

const getAdminStats = async (req, res) => {
  const ahora = new Date();

  const [
    usuariosActivos,
    materialesCompartidos,
    sesionesCreadas,
    denunciasPendientes,
    denunciasTotal,
    denunciasAceptadas,
    denunciasRechazadas,
    sesionesActivas,
    participantesTotales,
  ] = await Promise.all([
    usuario.count({ where: { activo: true } }),
    material.count({ where: { suspendido: false } }),
    sesion_estudio.count(),
    denuncia.count({ where: { estado: "pendiente" } }),
    denuncia.count(),
    denuncia.count({ where: { estado: "verificada" } }),
    denuncia.count({ where: { estado: "rechazada" } }),
    sesion_estudio.count({
      where: { cancelada: false, fecha_hora: { [Op.gte]: ahora } },
    }),
    inscripcion_sesion.count({ where: { estado: "aceptada" } }),
  ]);

  const [
    materiasCursadasAlumno,
    materiasAprobadasAlumno,
    materiasPorCarrera,
    materiasConMasMateriales,
    participantesPorSesion,
    ocupacion,
    carrerasActivas,
    conexionesPromedio,
    usuariosActivosSerie,
    sesionesPorMes,
    distribucionConexionesData,
  ] = await Promise.all([
    computeDistribucionMaterias("cursando", [
      { label: "1-2 materias", range: [1, 2] },
      { label: "3-4 materias", range: [3, 4] },
      { label: "5-6 materias", range: [5, 6] },
      { label: "7+ materias",  range: [7, null] },
    ]),
    computeDistribucionMaterias("aprobada", [
      { label: "0-5 materias",   range: [0, 5] },
      { label: "6-10 materias",  range: [6, 10] },
      { label: "11-15 materias", range: [11, 15] },
      { label: "16+ materias",   range: [16, null] },
    ]),
    computeMateriasPorCarrera(),
    computeTopMaterias(),
    computeParticipantesPorSesion(),
    computeOcupacion(),
    computeCarrerasActivas(),
    computeConexionesPromedio(),
    computeUsuariosActivosSerie(),
    computeSesionesPorMes(),
    computeDistribucionConexionesData(),
  ]);

  const promedio = Math.round(sesionesCreadas / 12);

  return res.status(200).json({
    ok: true,
    data: {
      usoSistema: {
        metricas: buildMetricasUso({
          usuariosActivos,
          materialesCompartidos,
          sesionesCreadas,
          denunciasPendientes,
        }),
        usuariosActivosSerie,
        materiasCursadasAlumno,
        materiasAprobadasAlumno,
        materiasPorCarrera,
        sesionesPeriodo: {
          total: sesionesCreadas,
          promedio,
          months: sesionesPorMes.months,
          data: sesionesPorMes.data,
        },
        materiasConMasMateriales,
        moderacion: {
          total: denunciasTotal,
          pendientes: denunciasPendientes,
          aceptadas: denunciasAceptadas,
          rechazadas: denunciasRechazadas,
        },
      },
      reportesSociales: {
        metricas: buildMetricasSociales({
          conexionesPromedio,
          sesionesActivas,
          participantesTotales,
          tasaOcupacion: ocupacion.percentage,
        }),
        distribucionConexiones: distribucionConexionesData.map((d) => d.label),
        distribucionConexionesData,
        participantesPorSesion,
        ocupacion: {
          percentage: ocupacion.percentage,
          cuposLlenos: ocupacion.cuposLlenos,
          conDisponibilidad: ocupacion.conDisponibilidad,
        },
        carrerasActivas,
      },
    },
  });
};

module.exports = { getAdminStats };
