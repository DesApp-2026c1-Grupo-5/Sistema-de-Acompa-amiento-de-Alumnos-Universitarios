/**
 * Seed de la base de datos SIVA UNAHUR.
 * Dataset extendido para que las estadísticas admin se vean pobladas.
 * Ejecutar con: `node seed.js` desde backEnd/.
 */
require("dotenv").config();
const db = require("./src/db/models");
const { hashPassword } = require("./src/utils/password");

const DEV_PASSWORD = "123456";

const monthsAgo = (n, day = 1) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(day);
  d.setHours(12, 0, 0, 0);
  // Evita fechas futuras: para el mes actual con un día posterior a hoy,
  // retrocede hasta caer en el pasado.
  while (d.getTime() > Date.now()) {
    d.setMonth(d.getMonth() - 1);
  }
  return d;
};

const monthsAhead = (n, day = 1) => {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  d.setDate(day);
  d.setHours(19, 0, 0, 0);
  return d;
};

async function seed() {
  await db.sequelize.sync({ force: true });
  console.log("· Esquema sincronizado");

  const devPasswordHash = await hashPassword(DEV_PASSWORD);

  // 1. Carreras + planes
  const [carreraTPI, carreraLicSI] = await db.carrera.bulkCreate(
    [
      { nombre: "Tecnicatura en Programación Informática", titulo: "Técnico/a Universitario/a", instituto: "UNAHUR", duracion_anios: 3 },
      { nombre: "Licenciatura en Sistemas",                 titulo: "Licenciado/a en Sistemas",     instituto: "UNAHUR", duracion_anios: 5 },
    ],
    { returning: true }
  );

  const [planTPI2024, planLic2023] = await db.plan_estudio.bulkCreate(
    [
      { carrera_id: carreraTPI.id,   nombre: "TPI 2024",    anio: 2024, estado: "vigente", creditos_requeridos: 60,  niveles_ingles_requeridos: 1 },
      { carrera_id: carreraLicSI.id, nombre: "Lic SI 2023", anio: 2023, estado: "vigente", creditos_requeridos: 120, niveles_ingles_requeridos: 2 },
    ],
    { returning: true }
  );

  // 2. Materias — TPI: plan oficial UNAHUR (troncales + electivas, 21 materias); Lic SI: 4
  // Nombres EXACTOS y códigos del plan de estudios oficial (TUP_V1). Cuatrimestre y
  // correlativas reconstruidos del plan oficial (no figuran en el reporte de origen).
  const materias = await db.materia.bulkCreate(
    [
      // ── TPI · Primer año · 1º cuatrimestre ──
      { plan_id: planTPI2024.id, codigo: "788", nombre: "Matemática para informática I",                  anio_cursada: 1, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "790", nombre: "Organización de computadoras I",                 anio_cursada: 1, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "789", nombre: "Introducción a lógica y problemas computacionales", anio_cursada: 1, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "004", nombre: "Nuevos entornos y lenguajes",                    anio_cursada: 1, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: false, es_unahur: true },
      // ── TPI · Primer año · 2º cuatrimestre ──
      { plan_id: planTPI2024.id, codigo: "791", nombre: "Taller de lenguajes de marcado y tecnologías web", anio_cursada: 1, cuatrimestre: 2, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "792", nombre: "Programación estructurada",                      anio_cursada: 1, cuatrimestre: 2, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "793", nombre: "Matemática para Informática II",                 anio_cursada: 1, cuatrimestre: 2, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "030", nombre: "Inglés I",                                       anio_cursada: 1, cuatrimestre: 2, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 3, creditos_otorga: 4, es_optativa: false, es_unahur: true },
      // ── TPI · Segundo año · 1º cuatrimestre ──
      { plan_id: planTPI2024.id, codigo: "754", nombre: "Bases de datos",                                 anio_cursada: 2, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "753", nombre: "Programación con objetos I",                     anio_cursada: 2, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "752", nombre: "Estructuras de datos",                           anio_cursada: 2, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "043", nombre: "Inglés II",                                      anio_cursada: 2, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 3, creditos_otorga: 4, es_optativa: false, es_unahur: true },
      // ── TPI · Segundo año · 2º cuatrimestre ──
      { plan_id: planTPI2024.id, codigo: "765", nombre: "Programación con Objetos II",                    anio_cursada: 2, cuatrimestre: 2, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "761", nombre: "Programación funcional",                         anio_cursada: 2, cuatrimestre: 2, tipo: "electiva",     modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: true,  es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "766", nombre: "Programación Concurrente",                       anio_cursada: 2, cuatrimestre: 2, tipo: "electiva",     modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: true,  es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "756", nombre: "Redes de computadoras",                          anio_cursada: 2, cuatrimestre: 2, tipo: "electiva",     modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: true,  es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "795", nombre: "Organización de computadoras II",                anio_cursada: 2, cuatrimestre: 2, tipo: "electiva",     modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: true,  es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "757", nombre: "Sistemas operativos",                            anio_cursada: 2, cuatrimestre: 2, tipo: "electiva",     modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: true,  es_unahur: true },
      // ── TPI · Tercer año · 1º cuatrimestre ──
      { plan_id: planTPI2024.id, codigo: "758", nombre: "Construcción de Interfaces de Usuario",          anio_cursada: 3, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, codigo: "759", nombre: "Estrategias de Persistencia",                    anio_cursada: 3, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: false, es_unahur: true },
      // ── TPI · Tercer año · 2º cuatrimestre ──
      { plan_id: planTPI2024.id, codigo: "760", nombre: "Elementos de ingeniería de software",            anio_cursada: 3, cuatrimestre: 2, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: false, es_unahur: true },
      // ── Lic SI ──
      { plan_id: planLic2023.id, codigo: "RED-1", nombre: "Redes",                 anio_cursada: 3, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: false, es_unahur: true },
      { plan_id: planLic2023.id, codigo: "SO-1",  nombre: "Sistemas Operativos",   anio_cursada: 2, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planLic2023.id, codigo: "IA-1",  nombre: "Inteligencia Artificial", anio_cursada: 4, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: false, es_unahur: true },
      { plan_id: planLic2023.id, codigo: "ARQ-1", nombre: "Arquitectura de Computadoras", anio_cursada: 2, cuatrimestre: 1, tipo: "obligatoria", modalidad: "Cuatrimestral", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: false, es_unahur: true },
    ],
    { returning: true }
  );
  const [
    // TPI · Año 1
    matMatI, matOrgI, matLogica, matNEL, matWebMarcado, matProgEstr, matMatII, matIngI,
    // TPI · Año 2
    matBDatos, matPOOI, matEstDatos, matIngII, matPOOII, matProgFunc, matProgConc, matRedesTUP, matOrgII, matSO_TUP,
    // TPI · Año 3
    matCIU, matPersist, matIngSoft,
    // Lic SI
    matRedes, matSO, matIA, matArq,
  ] = materias;

  // Alias hacia el dataset de trayectoria/materiales/sesiones existente (no requiere reescribir el resto).
  const matAlgo = matProgEstr, matMat1 = matMatI, matProg1 = matLogica, matBD = matBDatos,
        matPOO = matPOOI, matAlgo2 = matEstDatos, matWeb = matWebMarcado, matIng = matIngI;

  // Correlativas del plan oficial TUP UNAHUR
  await db.correlatividad.bulkCreate([
    // Año 1 · 2º cuatrimestre
    { materia_id: matMatII.id,      materia_requisito_id: matMatI.id,      tipo: "aprobar" },
    { materia_id: matProgEstr.id,   materia_requisito_id: matLogica.id,    tipo: "aprobar" },
    { materia_id: matWebMarcado.id, materia_requisito_id: matNEL.id,       tipo: "cursar"  },
    // Año 2 · 1º cuatrimestre
    { materia_id: matIngII.id,      materia_requisito_id: matIngI.id,      tipo: "aprobar" },
    { materia_id: matBDatos.id,     materia_requisito_id: matProgEstr.id,  tipo: "aprobar" },
    { materia_id: matPOOI.id,       materia_requisito_id: matProgEstr.id,  tipo: "aprobar" },
    { materia_id: matEstDatos.id,   materia_requisito_id: matProgEstr.id,  tipo: "aprobar" },
    // Año 2 · 2º cuatrimestre
    { materia_id: matPOOII.id,      materia_requisito_id: matPOOI.id,      tipo: "aprobar" },
    { materia_id: matProgFunc.id,   materia_requisito_id: matPOOI.id,      tipo: "aprobar" },
    { materia_id: matProgConc.id,   materia_requisito_id: matPOOI.id,      tipo: "aprobar" },
    { materia_id: matRedesTUP.id,   materia_requisito_id: matOrgI.id,      tipo: "aprobar" },
    { materia_id: matOrgII.id,      materia_requisito_id: matOrgI.id,      tipo: "aprobar" },
    { materia_id: matSO_TUP.id,     materia_requisito_id: matOrgI.id,      tipo: "aprobar" },
    // Año 3 · 1º cuatrimestre
    { materia_id: matCIU.id,        materia_requisito_id: matPOOII.id,     tipo: "aprobar" },
    { materia_id: matPersist.id,    materia_requisito_id: matPOOII.id,     tipo: "aprobar" },
    { materia_id: matPersist.id,    materia_requisito_id: matBDatos.id,    tipo: "aprobar" },
    // Año 3 · 2º cuatrimestre
    { materia_id: matIngSoft.id,    materia_requisito_id: matPOOII.id,     tipo: "aprobar" },
    // Lic SI
    { materia_id: matIA.id,         materia_requisito_id: matSO.id,        tipo: "aprobar" },
  ]);

  await db.oferta_academica.bulkCreate([
    { materia_id: matAlgo.id,  anio: 2026, cuatrimestre: 1, turno: "noche",  aula: "A12", docente: "Pérez" },
    { materia_id: matBD.id,    anio: 2026, cuatrimestre: 1, turno: "tarde",  aula: "B07", docente: "Gómez" },
    { materia_id: matPOO.id,   anio: 2026, cuatrimestre: 2, turno: "mañana", aula: "C03", docente: "Ramírez" },
    { materia_id: matWeb.id,   anio: 2026, cuatrimestre: 2, turno: "noche",  aula: "C05", docente: "Sosa" },
    { materia_id: matSO.id,    anio: 2026, cuatrimestre: 1, turno: "mañana", aula: "D02", docente: "Aguilar" },
  ]);

  // 3. Identidad: admin + 10 estudiantes (8 activos, 2 inactivos)
  const usuarios = await db.usuario.bulkCreate(
    [
      { email: "admin@demo.com",    password_hash: devPasswordHash, tipo: "administrador", activo: true  },
      { email: "facu@alumno.com",   password_hash: devPasswordHash, tipo: "estudiante",    activo: true  },
      { email: "lara@alumno.com",   password_hash: devPasswordHash, tipo: "estudiante",    activo: true  },
      { email: "diego@alumno.com",  password_hash: devPasswordHash, tipo: "estudiante",    activo: false },
      { email: "sofia@alumno.com",  password_hash: devPasswordHash, tipo: "estudiante",    activo: true  },
      { email: "mateo@alumno.com",  password_hash: devPasswordHash, tipo: "estudiante",    activo: true  },
      { email: "valen@alumno.com",  password_hash: devPasswordHash, tipo: "estudiante",    activo: true  },
      { email: "tomas@alumno.com",  password_hash: devPasswordHash, tipo: "estudiante",    activo: true  },
      { email: "julia@alumno.com",  password_hash: devPasswordHash, tipo: "estudiante",    activo: true  },
      { email: "bruno@alumno.com",  password_hash: devPasswordHash, tipo: "estudiante",    activo: false },
      { email: "ana@alumno.com",    password_hash: devPasswordHash, tipo: "estudiante",    activo: true  },
    ],
    { returning: true }
  );
  const [uAdmin, uFacu, uLara, uDiego, uSofia, uMateo, uValen, uTomas, uJulia, uBruno, uAna] = usuarios;

  const [admin1] = await db.administrador.bulkCreate(
    [{ usuario_id: uAdmin.id, nombre: "Sofía", apellido: "Operadora", creado_por: null }],
    { returning: true }
  );

  // Admins extra para probar paginación (15 en total → 2 páginas a 10/pág)
  const adminsExtraNombres = [
    ["Carla", "Domínguez"], ["Martín", "Suárez"], ["Paula", "Ibáñez"],
    ["Nicolás", "Ferreyra"], ["Lucía", "Morales"], ["Ramiro", "Ávila"],
    ["Florencia", "Quiroga"], ["Gonzalo", "Herrera"], ["Camila", "Navarro"],
    ["Federico", "Ojeda"], ["Agustina", "Ponce"], ["Hernán", "Rivas"],
    ["Mariana", "Cabrera"], ["Iván", "Luna"],
  ];
  const adminUsuarios = await db.usuario.bulkCreate(
    adminsExtraNombres.map((_, i) => ({
      email: `admin${i + 2}@demo.com`,
      password_hash: devPasswordHash,
      tipo: "administrador",
      activo: true,
    })),
    { returning: true }
  );
  await db.administrador.bulkCreate(
    adminUsuarios.map((u, i) => ({
      usuario_id: u.id,
      nombre: adminsExtraNombres[i][0],
      apellido: adminsExtraNombres[i][1],
      creado_por: admin1.id,
      createdAt: monthsAgo(i % 6, ((i * 3) % 27) + 1),
      updatedAt: new Date(),
    }))
  );

  const estudiantes = await db.estudiante.bulkCreate(
    [
      { usuario_id: uFacu.id,  nombre: "Facundo",  apellido: "Torres",   privacidad: "publico",   pub_inscripciones: true,  pub_regularizaciones: true,  pub_aprobaciones: true,  bio: "Estudiante de TPI. Me interesa el desarrollo web." },
      { usuario_id: uLara.id,  nombre: "Lara",     apellido: "Méndez",   privacidad: "contactos", pub_inscripciones: true,  pub_regularizaciones: false, pub_aprobaciones: true,  bio: "Cursando segundo año. Armo grupos de estudio para los parciales." },
      { usuario_id: uDiego.id, nombre: "Diego",    apellido: "Ríos",     privacidad: "privado",   pub_inscripciones: false, pub_regularizaciones: false, pub_aprobaciones: false, bio: "Lic SI, enfocado en redes y BD." },
      { usuario_id: uSofia.id, nombre: "Sofía",    apellido: "Pereyra",  privacidad: "publico",   pub_inscripciones: true,  pub_regularizaciones: true,  pub_aprobaciones: true,  bio: "Apasionada por algoritmos y matemática." },
      { usuario_id: uMateo.id, nombre: "Mateo",    apellido: "Acosta",   privacidad: "contactos", pub_inscripciones: true,  pub_regularizaciones: true,  pub_aprobaciones: true,  bio: "Tutor de Programación I." },
      { usuario_id: uValen.id, nombre: "Valentina",apellido: "López",    privacidad: "publico",   pub_inscripciones: true,  pub_regularizaciones: false, pub_aprobaciones: true,  bio: "Tercer año TPI." },
      { usuario_id: uTomas.id, nombre: "Tomás",    apellido: "Giménez",  privacidad: "publico",   pub_inscripciones: true,  pub_regularizaciones: true,  pub_aprobaciones: true,  bio: "Comparto apuntes y videos." },
      { usuario_id: uJulia.id, nombre: "Julia",    apellido: "Bravo",    privacidad: "contactos", pub_inscripciones: true,  pub_regularizaciones: true,  pub_aprobaciones: true,  bio: "Lic SI, interés en IA." },
      { usuario_id: uBruno.id, nombre: "Bruno",    apellido: "Castro",   privacidad: "privado",   pub_inscripciones: false, pub_regularizaciones: false, pub_aprobaciones: false, bio: "Cuenta inactiva." },
      { usuario_id: uAna.id,   nombre: "Ana",      apellido: "Vega",     privacidad: "publico",   pub_inscripciones: true,  pub_regularizaciones: true,  pub_aprobaciones: true,  bio: "Lic SI, redes y sistemas." },
    ],
    { returning: true }
  );
  const [estFacu, estLara, estDiego, estSofia, estMateo, estValen, estTomas, estJulia, estBruno, estAna] = estudiantes;

  // 4. Motivos de denuncia
  const motivos = await db.motivo_denuncia.bulkCreate(
    [
      { descripcion: "Contenido inapropiado",  activo: true },
      { descripcion: "Material con copyright", activo: true },
      { descripcion: "Spam o publicidad",      activo: true },
      { descripcion: "Información incorrecta", activo: true },
      { descripcion: "Lenguaje ofensivo",      activo: true },
    ],
    { returning: true }
  );

  // 5. Trayectoria académica
  // TPI: Facu, Lara, Sofia, Mateo, Valen, Tomas (6); Lic SI: Diego, Julia, Ana (3); Bruno: inactivo sin situación.
  const situaciones = await db.situacion_academica.bulkCreate(
    [
      { estudiante_id: estFacu.id,  plan_id: planTPI2024.id, fecha_inicio: new Date("2024-03-01") },
      { estudiante_id: estLara.id,  plan_id: planTPI2024.id, fecha_inicio: new Date("2024-03-01") },
      { estudiante_id: estSofia.id, plan_id: planTPI2024.id, fecha_inicio: new Date("2023-03-01") },
      { estudiante_id: estMateo.id, plan_id: planTPI2024.id, fecha_inicio: new Date("2023-03-01") },
      { estudiante_id: estValen.id, plan_id: planTPI2024.id, fecha_inicio: new Date("2022-03-01") },
      { estudiante_id: estTomas.id, plan_id: planTPI2024.id, fecha_inicio: new Date("2024-08-01") },
      { estudiante_id: estDiego.id, plan_id: planLic2023.id, fecha_inicio: new Date("2023-08-01") },
      { estudiante_id: estJulia.id, plan_id: planLic2023.id, fecha_inicio: new Date("2022-08-01") },
      { estudiante_id: estAna.id,   plan_id: planLic2023.id, fecha_inicio: new Date("2023-03-01") },
    ],
    { returning: true }
  );
  const [sitFacu, sitLara, sitSofia, sitMateo, sitValen, sitTomas, sitDiego, sitJulia, sitAna] = situaciones;

  // Estado por materia: mix para que las distribuciones tengan datos
  const mk = (situacion_id, materia_id, estado, anio, cuatri, nota = null, fecha = null) => ({
    situacion_id, materia_id, estado, anio, cuatrimestre: cuatri, nota, fecha,
  });

  const estadosMaterias = await db.estado_materia.bulkCreate(
    [
      // Facu (TPI): 3 aprobadas, 2 cursando
      mk(sitFacu.id,  matAlgo.id,   "aprobada", 2024, 1, 9, new Date("2024-07-15")),
      mk(sitFacu.id,  matMat1.id,   "aprobada", 2024, 1, 7, new Date("2024-07-15")),
      mk(sitFacu.id,  matProg1.id,  "aprobada", 2024, 2, 8, new Date("2024-12-10")),
      mk(sitFacu.id,  matBD.id,     "cursando", 2026, 1),
      mk(sitFacu.id,  matPOO.id,    "cursando", 2026, 1),
      // Lara (TPI): 3 aprobadas, 1 cursando
      mk(sitLara.id,  matAlgo.id,   "aprobada", 2024, 2, 7, new Date("2024-12-10")),
      mk(sitLara.id,  matMat1.id,   "aprobada", 2024, 2, 6, new Date("2024-12-10")),
      mk(sitLara.id,  matProg1.id,  "aprobada", 2024, 2, 8, new Date("2024-12-10")),
      mk(sitLara.id,  matBD.id,     "cursando", 2026, 1),
      // Sofia (TPI): 6 aprobadas. Algoritmos II y Programación Web quedan
      // sin cursar (pendientes) con sus correlativas aprobadas → disponibles.
      mk(sitSofia.id, matAlgo.id,   "aprobada", 2023, 1, 10, new Date("2023-07-10")),
      mk(sitSofia.id, matMat1.id,   "aprobada", 2023, 1, 9,  new Date("2023-07-10")),
      mk(sitSofia.id, matProg1.id,  "aprobada", 2023, 2, 9,  new Date("2023-12-15")),
      mk(sitSofia.id, matBD.id,     "aprobada", 2024, 1, 8,  new Date("2024-07-20")),
      mk(sitSofia.id, matPOO.id,    "aprobada", 2024, 1, 9,  new Date("2024-07-20")),
      mk(sitSofia.id, matIng.id,    "aprobada", 2024, 2, 10, new Date("2024-12-12")),
      // Mateo (TPI): 4 aprobadas, 1 regular, 1 cursando
      mk(sitMateo.id, matAlgo.id,   "aprobada", 2023, 1, 8,  new Date("2023-07-10")),
      mk(sitMateo.id, matMat1.id,   "aprobada", 2023, 1, 7,  new Date("2023-07-10")),
      mk(sitMateo.id, matProg1.id,  "aprobada", 2023, 2, 9,  new Date("2023-12-15")),
      mk(sitMateo.id, matBD.id,     "aprobada", 2024, 1, 8,  new Date("2024-07-20")),
      mk(sitMateo.id, matPOO.id,    "regular",  2024, 2, 6,  new Date("2024-12-12")),
      mk(sitMateo.id, matAlgo2.id,  "cursando", 2026, 1),
      // Valen (TPI): 6 aprobadas, 1 regular, 1 cursando
      mk(sitValen.id, matAlgo.id,   "aprobada", 2022, 1, 9,  new Date("2022-07-10")),
      mk(sitValen.id, matMat1.id,   "aprobada", 2022, 1, 8,  new Date("2022-07-10")),
      mk(sitValen.id, matProg1.id,  "aprobada", 2022, 2, 9,  new Date("2022-12-15")),
      mk(sitValen.id, matBD.id,     "aprobada", 2023, 1, 8,  new Date("2023-07-20")),
      mk(sitValen.id, matPOO.id,    "aprobada", 2023, 2, 9,  new Date("2023-12-12")),
      mk(sitValen.id, matAlgo2.id,  "aprobada", 2024, 1, 8,  new Date("2024-07-15")),
      mk(sitValen.id, matNEL.id,    "regular",  2024, 2, 6,  new Date("2024-12-12")),
      mk(sitValen.id, matWeb.id,    "cursando", 2026, 1),
      // Tomas (TPI): 1 cursando — recién empieza
      mk(sitTomas.id, matMat1.id,   "cursando", 2026, 1),
      // Diego (Lic SI): 2 aprobadas, 1 cursando
      mk(sitDiego.id, matRedes.id,  "aprobada", 2024, 2, 8,  new Date("2024-12-20")),
      mk(sitDiego.id, matSO.id,     "aprobada", 2024, 1, 7,  new Date("2024-07-25")),
      mk(sitDiego.id, matArq.id,    "cursando", 2026, 1),
      // Julia (Lic SI): 3 aprobadas, 1 cursando
      mk(sitJulia.id, matRedes.id,  "aprobada", 2023, 1, 9,  new Date("2023-07-15")),
      mk(sitJulia.id, matSO.id,     "aprobada", 2023, 2, 8,  new Date("2023-12-10")),
      mk(sitJulia.id, matArq.id,    "aprobada", 2023, 2, 9,  new Date("2023-12-10")),
      mk(sitJulia.id, matIA.id,     "cursando", 2026, 1),
      // Ana (Lic SI): 3 aprobadas, 1 cursando
      mk(sitAna.id,   matRedes.id,  "aprobada", 2023, 2, 7,  new Date("2023-12-10")),
      mk(sitAna.id,   matSO.id,     "aprobada", 2024, 1, 8,  new Date("2024-07-20")),
      mk(sitAna.id,   matArq.id,    "aprobada", 2024, 2, 7,  new Date("2024-12-15")),
      mk(sitAna.id,   matIA.id,     "cursando", 2026, 1),
    ],
    { returning: true }
  );

  await db.final.bulkCreate(
    estadosMaterias
      .filter((em) => em.estado === "aprobada")
      .slice(0, 10)
      .map((em) => ({
        estado_materia_id: em.id,
        fecha: em.fecha || new Date(),
        nota: em.nota || 7,
        aprobado: true,
      }))
  );

  await db.actividad_credito.bulkCreate([
    { situacion_id: sitFacu.id,  descripcion: "Curso de inglés A2",       creditos: 2, fecha: new Date("2025-06-01"), comprobante_url: "https://example.com/c1.pdf" },
    { situacion_id: sitFacu.id,  descripcion: "Hackathon UNAHUR",         creditos: 1, fecha: new Date("2025-09-10"), comprobante_url: null },
    { situacion_id: sitDiego.id, descripcion: "Voluntariado tecnológico", creditos: 3, fecha: new Date("2024-10-05"), comprobante_url: null },
    { situacion_id: sitSofia.id, descripcion: "Curso de Docker",          creditos: 2, fecha: new Date("2025-03-15"), comprobante_url: null },
    { situacion_id: sitJulia.id, descripcion: "Investigación IA",         creditos: 4, fecha: new Date("2024-11-20"), comprobante_url: null },
  ]);

  const planesCursada = await db.plan_cursada.bulkCreate(
    [
      { situacion_id: sitFacu.id,  nombre: "Plan 2026 Facu",  activo: true, created_at: new Date() },
      { situacion_id: sitLara.id,  nombre: "Plan 2026 Lara",  activo: true, created_at: new Date() },
      { situacion_id: sitSofia.id, nombre: "Plan 2026 Sofía", activo: true, created_at: new Date() },
      { situacion_id: sitJulia.id, nombre: "Plan 2026 Julia", activo: true, created_at: new Date() },
    ],
    { returning: true }
  );
  const [pcFacu, pcLara, pcSofia, pcJulia] = planesCursada;

  await db.plan_cursada_item.bulkCreate([
    { plan_id: pcFacu.id,  materia_id: matBD.id,   anio_proyectado: 2026, cuatrimestre_proyectado: 1 },
    { plan_id: pcFacu.id,  materia_id: matPOO.id,  anio_proyectado: 2026, cuatrimestre_proyectado: 2 },
    { plan_id: pcLara.id,  materia_id: matBD.id,   anio_proyectado: 2026, cuatrimestre_proyectado: 1 },
    { plan_id: pcSofia.id, materia_id: matWeb.id,  anio_proyectado: 2026, cuatrimestre_proyectado: 1 },
    { plan_id: pcJulia.id, materia_id: matIA.id,   anio_proyectado: 2026, cuatrimestre_proyectado: 1 },
  ]);

  // 6. Repositorio de materiales
  const tags = await db.tag.bulkCreate(
    [{ nombre: "apunte" }, { nombre: "parcial" }, { nombre: "video" }, { nombre: "resumen" }, { nombre: "ejercicio" }],
    { returning: true }
  );
  const [tagApunte, tagParcial, tagVideo, tagResumen, tagEjercicio] = tags;

  const materialesData = [
    // Algoritmos I (top: 4 materiales)
    { materia_id: matAlgo.id,  estudiante_id: estFacu.id,  tipo: "file",    titulo: "Resumen Algoritmos I",    descripcion: "Resumen completo",        url_o_path: "https://example.com/r-algo.pdf",     formato: "pdf", size_bytes: 245000, createdAt: monthsAgo(5) },
    { materia_id: matAlgo.id,  estudiante_id: estSofia.id, tipo: "file",    titulo: "Parcial 1 Algoritmos",    descripcion: "Resuelto paso a paso",    url_o_path: "https://example.com/p1-algo.pdf",    formato: "pdf", size_bytes: 180000, createdAt: monthsAgo(4) },
    { materia_id: matAlgo.id,  estudiante_id: estMateo.id, tipo: "video",   titulo: "Video clase 5 Algoritmos",descripcion: "Ordenamiento",            url_o_path: "https://youtube.com/watch?v=a1",     formato: "url", subtipo_link: "youtube", createdAt: monthsAgo(3) },
    { materia_id: matAlgo.id,  estudiante_id: estValen.id, tipo: "file",    titulo: "Apuntes recursión",       descripcion: "Notas de clase",          url_o_path: "https://example.com/rec-algo.pdf",   formato: "pdf", size_bytes: 95000,  createdAt: monthsAgo(2) },
    // BD (3)
    { materia_id: matBD.id,    estudiante_id: estFacu.id,  tipo: "discord", titulo: "Server estudio BD",       descripcion: "Canal de consultas",      url_o_path: "https://discord.gg/unahur-bd",       discord_servidor: "UNAHUR-BD", discord_canal: "general", createdAt: monthsAgo(4) },
    { materia_id: matBD.id,    estudiante_id: estDiego.id, tipo: "file",    titulo: "Parcial 1 BD 2024",       descripcion: "Resuelto",                url_o_path: "https://example.com/p-bd.pdf",       formato: "pdf", size_bytes: 180000, createdAt: monthsAgo(3) },
    { materia_id: matBD.id,    estudiante_id: estJulia.id, tipo: "file",    titulo: "Apunte normalización",    descripcion: "1FN-3FN explicado",       url_o_path: "https://example.com/norm-bd.pdf",    formato: "pdf", size_bytes: 130000, createdAt: monthsAgo(2) },
    // POO (3)
    { materia_id: matPOO.id,   estudiante_id: estLara.id,  tipo: "video",   titulo: "Video clase 3 POO",       descripcion: "Grabación de la clase",   url_o_path: "https://youtube.com/watch?v=p1",     formato: "url", subtipo_link: "youtube", createdAt: monthsAgo(5) },
    { materia_id: matPOO.id,   estudiante_id: estSofia.id, tipo: "file",    titulo: "Resumen herencia POO",    descripcion: "Conceptos clave",         url_o_path: "https://example.com/her-poo.pdf",    formato: "pdf", size_bytes: 110000, createdAt: monthsAgo(2) },
    { materia_id: matPOO.id,   estudiante_id: estMateo.id, tipo: "file",    titulo: "Ejercicios POO",          descripcion: "Práctica con soluciones", url_o_path: "https://example.com/ej-poo.pdf",     formato: "pdf", size_bytes: 220000, createdAt: monthsAgo(1) },
    // Programación I (2)
    { materia_id: matProg1.id, estudiante_id: estTomas.id, tipo: "file",    titulo: "Apuntes Programación I",  descripcion: "Notas de clase",          url_o_path: "https://example.com/ap-prog1.pdf",   formato: "pdf", size_bytes: 90000,  createdAt: monthsAgo(3) },
    { materia_id: matProg1.id, estudiante_id: estValen.id, tipo: "video",   titulo: "Video Programación I",    descripcion: "Intro a variables",       url_o_path: "https://youtube.com/watch?v=pr1",    formato: "url", subtipo_link: "youtube", createdAt: monthsAgo(0, 5) },
    // Matemática I (1)
    { materia_id: matMat1.id,  estudiante_id: estSofia.id, tipo: "file",    titulo: "Resumen Matemática I",    descripcion: "Derivadas e integrales",  url_o_path: "https://example.com/mat1.pdf",       formato: "pdf", size_bytes: 200000, createdAt: monthsAgo(2) },
    // Redes (2)
    { materia_id: matRedes.id, estudiante_id: estDiego.id, tipo: "file",    titulo: "Apunte modelo OSI",       descripcion: "Capas explicadas",        url_o_path: "https://example.com/osi.pdf",        formato: "pdf", size_bytes: 150000, createdAt: monthsAgo(4) },
    { materia_id: matRedes.id, estudiante_id: estAna.id,   tipo: "video",   titulo: "Video TCP/IP",            descripcion: "Protocolos",              url_o_path: "https://youtube.com/watch?v=red1",   formato: "url", subtipo_link: "youtube", createdAt: monthsAgo(1) },
    // SO (1)
    { materia_id: matSO.id,    estudiante_id: estJulia.id, tipo: "file",    titulo: "Apunte procesos SO",      descripcion: "Scheduling",              url_o_path: "https://example.com/so.pdf",         formato: "pdf", size_bytes: 175000, createdAt: monthsAgo(3) },
    // IA (1)
    { materia_id: matIA.id,    estudiante_id: estJulia.id, tipo: "file",    titulo: "Resumen redes neuronales",descripcion: "Intro a ML",              url_o_path: "https://example.com/ia.pdf",         formato: "pdf", size_bytes: 230000, createdAt: monthsAgo(0, 10) },
    // Web (1)
    { materia_id: matWeb.id,   estudiante_id: estSofia.id, tipo: "file",    titulo: "Apunte React + Vite",     descripcion: "Setup y patrones",        url_o_path: "https://example.com/web.pdf",        formato: "pdf", size_bytes: 280000, createdAt: monthsAgo(0, 15) },
  ].map((m) => ({ ...m, suspendido: false, updatedAt: m.createdAt }));

  const materiales = await db.material.bulkCreate(materialesData, { returning: true });

  // Tags por material — variados
  await materiales[0].addTags([tagApunte.id, tagResumen.id]);
  await materiales[1].addTags([tagParcial.id]);
  await materiales[2].addTags([tagVideo.id]);
  await materiales[3].addTags([tagApunte.id]);
  await materiales[5].addTags([tagParcial.id, tagApunte.id]);
  await materiales[6].addTags([tagApunte.id, tagResumen.id]);
  await materiales[7].addTags([tagVideo.id]);
  await materiales[8].addTags([tagResumen.id]);
  await materiales[9].addTags([tagEjercicio.id]);
  await materiales[10].addTags([tagApunte.id]);
  await materiales[11].addTags([tagVideo.id]);
  await materiales[12].addTags([tagResumen.id]);
  await materiales[13].addTags([tagApunte.id]);
  await materiales[14].addTags([tagVideo.id]);
  await materiales[15].addTags([tagApunte.id]);
  await materiales[16].addTags([tagResumen.id]);
  await materiales[17].addTags([tagApunte.id]);

  // Valoraciones — mix like/dislike, materiales top con mejor rating
  await db.valoracion.bulkCreate([
    // Material 0 (Resumen Algo) — muy bueno: 4 likes / 0 dislikes
    { material_id: materiales[0].id, estudiante_id: estLara.id,  valor: "like",    fecha: monthsAgo(4) },
    { material_id: materiales[0].id, estudiante_id: estSofia.id, valor: "like",    fecha: monthsAgo(3) },
    { material_id: materiales[0].id, estudiante_id: estMateo.id, valor: "like",    fecha: monthsAgo(3) },
    { material_id: materiales[0].id, estudiante_id: estValen.id, valor: "like",    fecha: monthsAgo(2) },
    // Material 1 (Parcial Algo) — 3 likes 1 dislike
    { material_id: materiales[1].id, estudiante_id: estFacu.id,  valor: "like",    fecha: monthsAgo(3) },
    { material_id: materiales[1].id, estudiante_id: estMateo.id, valor: "like",    fecha: monthsAgo(3) },
    { material_id: materiales[1].id, estudiante_id: estTomas.id, valor: "like",    fecha: monthsAgo(2) },
    { material_id: materiales[1].id, estudiante_id: estLara.id,  valor: "dislike", fecha: monthsAgo(2) },
    // Material 5 (BD Parcial) — 3 likes
    { material_id: materiales[5].id, estudiante_id: estFacu.id,  valor: "like",    fecha: monthsAgo(2) },
    { material_id: materiales[5].id, estudiante_id: estJulia.id, valor: "like",    fecha: monthsAgo(2) },
    { material_id: materiales[5].id, estudiante_id: estSofia.id, valor: "like",    fecha: monthsAgo(1) },
    // Material 6 (BD Normalización) — 2 likes
    { material_id: materiales[6].id, estudiante_id: estFacu.id,  valor: "like",    fecha: monthsAgo(1) },
    { material_id: materiales[6].id, estudiante_id: estLara.id,  valor: "like",    fecha: monthsAgo(1) },
    // Material 7 (POO video) — 2 likes 1 dislike
    { material_id: materiales[7].id, estudiante_id: estFacu.id,  valor: "like",    fecha: monthsAgo(4) },
    { material_id: materiales[7].id, estudiante_id: estMateo.id, valor: "like",    fecha: monthsAgo(3) },
    { material_id: materiales[7].id, estudiante_id: estSofia.id, valor: "dislike", fecha: monthsAgo(2) },
    // Material 8 (POO Herencia) — 3 likes
    { material_id: materiales[8].id, estudiante_id: estFacu.id,  valor: "like",    fecha: monthsAgo(1) },
    { material_id: materiales[8].id, estudiante_id: estLara.id,  valor: "like",    fecha: monthsAgo(1) },
    { material_id: materiales[8].id, estudiante_id: estMateo.id, valor: "like",    fecha: monthsAgo(0, 10) },
    // Material 13 (OSI) — 2 likes
    { material_id: materiales[13].id, estudiante_id: estAna.id,  valor: "like",    fecha: monthsAgo(3) },
    { material_id: materiales[13].id, estudiante_id: estJulia.id,valor: "like",    fecha: monthsAgo(2) },
    // Material 16 (IA) — 1 like 1 dislike
    { material_id: materiales[16].id, estudiante_id: estAna.id,  valor: "like",    fecha: monthsAgo(0, 5) },
    { material_id: materiales[16].id, estudiante_id: estDiego.id,valor: "dislike", fecha: monthsAgo(0, 3) },
    // Material 17 (Web) — 1 like
    { material_id: materiales[17].id, estudiante_id: estFacu.id, valor: "like",    fecha: monthsAgo(0, 12) },
  ]);

  // 7. Denuncias — materiales y publicaciones
  await db.denuncia.bulkCreate([
    // Materiales — 4 pendientes, 2 verificadas, 1 rechazada
    { material_id: materiales[4].id,  denunciante_id: estLara.id,  motivo_id: motivos[2].id, admin_revisor_id: admin1.id, detalle: "Parece spam",                       estado: "pendiente",  fecha_creacion: monthsAgo(2), fecha_resolucion: null },
    { material_id: materiales[7].id,  denunciante_id: estDiego.id, motivo_id: motivos[1].id, admin_revisor_id: admin1.id, detalle: "Posible material con copyright",    estado: "pendiente",  fecha_creacion: monthsAgo(1), fecha_resolucion: null },
    { material_id: materiales[11].id, denunciante_id: estSofia.id, motivo_id: motivos[3].id, admin_revisor_id: admin1.id, detalle: "Información incorrecta sobre tipos", estado: "pendiente",  fecha_creacion: monthsAgo(1), fecha_resolucion: null },
    { material_id: materiales[16].id, denunciante_id: estDiego.id, motivo_id: motivos[3].id, admin_revisor_id: admin1.id, detalle: "Datos imprecisos",                  estado: "pendiente",  fecha_creacion: monthsAgo(0, 5),  fecha_resolucion: null },
    { material_id: materiales[2].id,  denunciante_id: estLara.id,  motivo_id: motivos[0].id, admin_revisor_id: admin1.id, detalle: "Lenguaje inapropiado en el video",   estado: "verificada", fecha_creacion: monthsAgo(3), fecha_resolucion: monthsAgo(2) },
    { material_id: materiales[14].id, denunciante_id: estFacu.id,  motivo_id: motivos[2].id, admin_revisor_id: admin1.id, detalle: "Promociona producto comercial",     estado: "verificada", fecha_creacion: monthsAgo(2), fecha_resolucion: monthsAgo(1) },
    { material_id: materiales[9].id,  denunciante_id: estLara.id,  motivo_id: motivos[4].id, admin_revisor_id: admin1.id, detalle: "Denuncia infundada",                estado: "rechazada",  fecha_creacion: monthsAgo(2), fecha_resolucion: monthsAgo(1) },
  ]);

  // 8. Contactos — red densa de aceptados
  const pares = [
    [estFacu, estLara],   [estFacu, estSofia], [estFacu, estMateo], [estFacu, estValen], [estFacu, estTomas],
    [estLara, estSofia],  [estLara, estMateo], [estLara, estValen],
    [estSofia, estMateo], [estSofia, estValen],[estSofia, estJulia],
    [estMateo, estTomas], [estMateo, estValen],
    [estValen, estTomas],
    [estDiego, estJulia], [estDiego, estAna],
    [estJulia, estAna],
    [estAna,  estFacu],
  ];
  await db.contacto.bulkCreate(
    pares.map(([a, b], idx) => ({
      estudiante_solicitante_id: a.id,
      estudiante_receptor_id: b.id,
      estado: "aceptado",
      fecha_solicitud: monthsAgo(4 - (idx % 4)),
      fecha_respuesta: monthsAgo(3 - (idx % 4)),
    }))
  );
  // Una pendiente
  await db.contacto.create({
    estudiante_solicitante_id: estTomas.id,
    estudiante_receptor_id: estDiego.id,
    estado: "pendiente",
    fecha_solicitud: monthsAgo(0, 10),
    fecha_respuesta: null,
  });

  // 9. Posts — distribuidos en los últimos 6 meses para que la serie temporal varíe
  const postsData = [
    { estudiante_id: estFacu.id,  contenido: "Aprobé Algoritmos!",                            event_type: "approved", event_subject: "Algoritmos I", createdAt: monthsAgo(5, 15) },
    { estudiante_id: estSofia.id, contenido: "Subí parcial 1 de Algoritmos resuelto",          event_type: "material",  event_subject: "Algoritmos I", createdAt: monthsAgo(5, 20) },
    { estudiante_id: estLara.id,  contenido: "Buscando grupo de estudio para POO",             createdAt: monthsAgo(5, 25) },
    { estudiante_id: estMateo.id, contenido: "Aprobé Programación I con 9!",                   event_type: "approved", event_subject: "Programación I", createdAt: monthsAgo(4, 3) },
    { estudiante_id: estValen.id, contenido: "Compartí apuntes de recursión",                  event_type: "material",  event_subject: "Algoritmos I", createdAt: monthsAgo(4, 8) },
    { estudiante_id: estFacu.id,  contenido: "Pasé a 2do año!",                                event_type: "regularized", event_subject: "Programación I", createdAt: monthsAgo(4, 20) },
    { estudiante_id: estJulia.id, contenido: "Subí apunte normalización BD",                   event_type: "material",  event_subject: "Bases de Datos", createdAt: monthsAgo(3, 5) },
    { estudiante_id: estDiego.id, contenido: "Compartí parcial BD",                            event_type: "material",  event_subject: "Bases de Datos", createdAt: monthsAgo(3, 10) },
    { estudiante_id: estSofia.id, contenido: "Alguien para hacer TP de BD?",                   createdAt: monthsAgo(3, 18) },
    { estudiante_id: estMateo.id, contenido: "Aprobé Bases de Datos!",                         event_type: "approved", event_subject: "Bases de Datos", createdAt: monthsAgo(3, 22) },
    { estudiante_id: estFacu.id,  contenido: "Sesión de estudio BD el viernes",                createdAt: monthsAgo(2, 5) },
    { estudiante_id: estSofia.id, contenido: "Subí resumen herencia POO",                      event_type: "material",  event_subject: "POO", createdAt: monthsAgo(2, 12) },
    { estudiante_id: estLara.id,  contenido: "Inscripta a POO 2026!",                          event_type: "inscribed", event_subject: "POO", createdAt: monthsAgo(2, 15) },
    { estudiante_id: estAna.id,   contenido: "Compartí video TCP/IP de Redes",                 event_type: "material",  event_subject: "Redes", createdAt: monthsAgo(1, 4) },
    { estudiante_id: estMateo.id, contenido: "Subí ejercicios resueltos POO",                  event_type: "material",  event_subject: "POO", createdAt: monthsAgo(1, 10) },
    { estudiante_id: estTomas.id, contenido: "Apuntes Programación I (mi primera contribución)", event_type: "material",  event_subject: "Programación I", createdAt: monthsAgo(1, 15) },
    { estudiante_id: estJulia.id, contenido: "Resumen redes neuronales para IA",                event_type: "material",  event_subject: "Inteligencia Artificial", createdAt: monthsAgo(0, 8) },
    { estudiante_id: estValen.id, contenido: "Video intro Programación I",                      event_type: "material",  event_subject: "Programación I", createdAt: monthsAgo(0, 12) },
    { estudiante_id: estSofia.id, contenido: "Apunte React + Vite para Web",                    event_type: "material",  event_subject: "Programación Web", createdAt: monthsAgo(0, 15) },
    { estudiante_id: estFacu.id,  contenido: "Buscando compañeros para POO",                    createdAt: monthsAgo(0, 18) },
    { estudiante_id: estMateo.id, contenido: "Sesión de práctica algoritmos II",                createdAt: monthsAgo(0, 20) },
    { estudiante_id: estDiego.id, contenido: "Aprobé SO!",                                      event_type: "approved", event_subject: "Sistemas Operativos", createdAt: monthsAgo(0, 22) },
    { estudiante_id: estLara.id,  contenido: "Cómo se organizan para POO?",                     createdAt: monthsAgo(0, 25) },
    { estudiante_id: estAna.id,   contenido: "Tip para entender arquitectura de computadoras",  createdAt: monthsAgo(0, 26) },
    { estudiante_id: estJulia.id, contenido: "Aprobé Arquitectura!",                            event_type: "approved", event_subject: "Arquitectura", createdAt: monthsAgo(0, 28) },
  ];
  const posts = await db.post.bulkCreate(
    postsData.map((p) => ({ ...p, updatedAt: p.createdAt })),
    { returning: true }
  );

  // Denuncias de publicaciones — 2 pendientes, 1 verificada
  await db.denuncia.bulkCreate([
    { post_id: posts[2].id,  denunciante_id: estFacu.id,  motivo_id: motivos[0].id, admin_revisor_id: null,      detalle: "Contenido inapropiado",              estado: "pendiente",  fecha_creacion: monthsAgo(0, 10), fecha_resolucion: null },
    { post_id: posts[11].id, denunciante_id: estSofia.id, motivo_id: motivos[2].id, admin_revisor_id: null,      detalle: "Publicidad no autorizada",           estado: "pendiente",  fecha_creacion: monthsAgo(0, 8),  fecha_resolucion: null },
    { post_id: posts[5].id,  denunciante_id: estLara.id,  motivo_id: motivos[1].id, admin_revisor_id: admin1.id, detalle: "Contenido copiado de otra fuente",  estado: "verificada", fecha_creacion: monthsAgo(0, 12), fecha_resolucion: monthsAgo(0, 10) },
  ]);

  // Votos
  await db.voto_post.bulkCreate([
    { post_id: posts[0].id,  estudiante_id: estLara.id,  tipo: "like" },
    { post_id: posts[0].id,  estudiante_id: estSofia.id, tipo: "like" },
    { post_id: posts[0].id,  estudiante_id: estMateo.id, tipo: "like" },
    { post_id: posts[1].id,  estudiante_id: estFacu.id,  tipo: "like" },
    { post_id: posts[1].id,  estudiante_id: estLara.id,  tipo: "like" },
    { post_id: posts[2].id,  estudiante_id: estSofia.id, tipo: "like" },
    { post_id: posts[3].id,  estudiante_id: estFacu.id,  tipo: "like" },
    { post_id: posts[3].id,  estudiante_id: estValen.id, tipo: "like" },
    { post_id: posts[4].id,  estudiante_id: estFacu.id,  tipo: "like" },
    { post_id: posts[4].id,  estudiante_id: estMateo.id, tipo: "like" },
    { post_id: posts[5].id,  estudiante_id: estSofia.id, tipo: "like" },
    { post_id: posts[6].id,  estudiante_id: estDiego.id, tipo: "like" },
    { post_id: posts[6].id,  estudiante_id: estAna.id,   tipo: "like" },
    { post_id: posts[7].id,  estudiante_id: estJulia.id, tipo: "like" },
    { post_id: posts[8].id,  estudiante_id: estFacu.id,  tipo: "like" },
    { post_id: posts[9].id,  estudiante_id: estFacu.id,  tipo: "like" },
    { post_id: posts[9].id,  estudiante_id: estSofia.id, tipo: "like" },
    { post_id: posts[10].id, estudiante_id: estLara.id,  tipo: "like" },
    { post_id: posts[11].id, estudiante_id: estLara.id,  tipo: "like" },
    { post_id: posts[11].id, estudiante_id: estMateo.id, tipo: "like" },
    { post_id: posts[12].id, estudiante_id: estFacu.id,  tipo: "like" },
    { post_id: posts[13].id, estudiante_id: estJulia.id, tipo: "like" },
    { post_id: posts[13].id, estudiante_id: estDiego.id, tipo: "like" },
    { post_id: posts[14].id, estudiante_id: estFacu.id,  tipo: "like" },
    { post_id: posts[14].id, estudiante_id: estLara.id,  tipo: "like" },
    { post_id: posts[15].id, estudiante_id: estValen.id, tipo: "like" },
    { post_id: posts[16].id, estudiante_id: estAna.id,   tipo: "like" },
    { post_id: posts[16].id, estudiante_id: estDiego.id, tipo: "dislike" },
    { post_id: posts[17].id, estudiante_id: estTomas.id, tipo: "like" },
    { post_id: posts[18].id, estudiante_id: estMateo.id, tipo: "like" },
    { post_id: posts[19].id, estudiante_id: estLara.id,  tipo: "like" },
    { post_id: posts[20].id, estudiante_id: estValen.id, tipo: "like" },
    { post_id: posts[21].id, estudiante_id: estJulia.id, tipo: "like" },
    { post_id: posts[22].id, estudiante_id: estFacu.id,  tipo: "like" },
    { post_id: posts[23].id, estudiante_id: estJulia.id, tipo: "like" },
    { post_id: posts[24].id, estudiante_id: estAna.id,   tipo: "like" },
  ]);

  // 10. Sesiones — 3 pasadas, 5 futuras
  const sesiones = await db.sesion_estudio.bulkCreate(
    [
      { creador_id: estFacu.id,  materia_id: matAlgo.id, tema: "Repaso ordenamiento",         tipo: "virtual",    link_ubicacion: "https://meet.x/algo1", fecha_hora: monthsAgo(3, 10), duracion_minutos: 90, cupos_max: 5, descripcion: "Repaso pre-parcial",       requiere_aprobacion: false, cancelada: false },
      { creador_id: estSofia.id, materia_id: matBD.id,   tema: "Práctica SQL avanzado",       tipo: "presencial", link_ubicacion: "Aula B07",             fecha_hora: monthsAgo(2, 5),  duracion_minutos: 60, cupos_max: 4, descripcion: "Joins y subqueries",       requiere_aprobacion: true,  cancelada: false },
      { creador_id: estMateo.id, materia_id: matPOO.id,  tema: "Patrones de diseño",          tipo: "virtual",    link_ubicacion: "https://meet.x/poo1",  fecha_hora: monthsAgo(1, 15), duracion_minutos: 90, cupos_max: 6, descripcion: "Factory y Singleton",      requiere_aprobacion: false, cancelada: false },
      { creador_id: estFacu.id,  materia_id: matBD.id,   tema: "Repaso normalización",        tipo: "virtual",    link_ubicacion: "https://meet.x/bd",    fecha_hora: monthsAhead(0, 25), duracion_minutos: 90, cupos_max: 5, descripcion: "1FN-3FN",                  requiere_aprobacion: false, cancelada: false },
      { creador_id: estLara.id,  materia_id: matPOO.id,  tema: "Práctica herencia",           tipo: "presencial", link_ubicacion: "Aula C03",             fecha_hora: monthsAhead(1, 5),  duracion_minutos: 60, cupos_max: 4, descripcion: null,                       requiere_aprobacion: true,  cancelada: false },
      { creador_id: estSofia.id, materia_id: matWeb.id,  tema: "Componentes en React",        tipo: "virtual",    link_ubicacion: "https://meet.x/web",   fecha_hora: monthsAhead(1, 12), duracion_minutos: 90, cupos_max: 8, descripcion: "Hooks y estado",           requiere_aprobacion: false, cancelada: false },
      { creador_id: estJulia.id, materia_id: matIA.id,   tema: "Intro a redes neuronales",    tipo: "virtual",    link_ubicacion: "https://meet.x/ia",    fecha_hora: monthsAhead(1, 20), duracion_minutos: 120, cupos_max: 6, descripcion: "Backprop básico",         requiere_aprobacion: false, cancelada: false },
      { creador_id: estDiego.id, materia_id: matRedes.id,tema: "Práctica subnetting",         tipo: "presencial", link_ubicacion: "Aula D01",             fecha_hora: monthsAhead(2, 3),  duracion_minutos: 90, cupos_max: 5, descripcion: "Ejercicios IPv4",          requiere_aprobacion: true,  cancelada: false },
      // Sesiones futuras extra para probar paginación de "disponibles" (creadores ≠ Facu, con cupo)
      { creador_id: estSofia.id, materia_id: matAlgo.id,  tema: "Repaso recursión",            tipo: "virtual",    link_ubicacion: "https://meet.x/algo2",  fecha_hora: monthsAhead(1, 3),  duracion_minutos: 90,  cupos_max: 6, descripcion: "Ejercicios de recursión",  requiere_aprobacion: false, cancelada: false },
      { creador_id: estMateo.id, materia_id: matMat1.id,  tema: "Integrales paso a paso",      tipo: "presencial", link_ubicacion: "Aula A05",              fecha_hora: monthsAhead(1, 7),  duracion_minutos: 60,  cupos_max: 5, descripcion: "Práctica de integrales",   requiere_aprobacion: false, cancelada: false },
      { creador_id: estLara.id,  materia_id: matProg1.id, tema: "Intro a punteros",            tipo: "virtual",    link_ubicacion: "https://meet.x/prog1",  fecha_hora: monthsAhead(1, 9),  duracion_minutos: 90,  cupos_max: 8, descripcion: "Memoria y punteros",       requiere_aprobacion: false, cancelada: false },
      { creador_id: estJulia.id, materia_id: matBD.id,    tema: "Modelado entidad-relación",   tipo: "virtual",    link_ubicacion: "https://meet.x/bd2",    fecha_hora: monthsAhead(1, 14), duracion_minutos: 120, cupos_max: 6, descripcion: "DER y pasaje a tablas",    requiere_aprobacion: false, cancelada: false },
      { creador_id: estValen.id, materia_id: matPOO.id,   tema: "Polimorfismo en Java",        tipo: "virtual",    link_ubicacion: "https://meet.x/poo3",   fecha_hora: monthsAhead(1, 18), duracion_minutos: 90,  cupos_max: 7, descripcion: "Interfaces y abstractas",  requiere_aprobacion: false, cancelada: false },
      { creador_id: estTomas.id, materia_id: matAlgo2.id, tema: "Grafos básicos",              tipo: "presencial", link_ubicacion: "Aula B12",              fecha_hora: monthsAhead(1, 22), duracion_minutos: 90,  cupos_max: 5, descripcion: "BFS y DFS",                requiere_aprobacion: true,  cancelada: false },
      { creador_id: estAna.id,   materia_id: matSO.id,    tema: "Sincronización de procesos",  tipo: "virtual",    link_ubicacion: "https://meet.x/so2",    fecha_hora: monthsAhead(2, 1),  duracion_minutos: 90,  cupos_max: 6, descripcion: "Semáforos y deadlocks",    requiere_aprobacion: false, cancelada: false },
      { creador_id: estDiego.id, materia_id: matArq.id,   tema: "Ensamblador intro",           tipo: "virtual",    link_ubicacion: "https://meet.x/arq",    fecha_hora: monthsAhead(2, 6),  duracion_minutos: 120, cupos_max: 8, descripcion: "Registros e instrucciones",requiere_aprobacion: false, cancelada: false },
      { creador_id: estSofia.id, materia_id: matWeb.id,   tema: "Routing en React",            tipo: "virtual",    link_ubicacion: "https://meet.x/web2",   fecha_hora: monthsAhead(2, 10), duracion_minutos: 90,  cupos_max: 8, descripcion: "React Router v7",          requiere_aprobacion: false, cancelada: false },
      { creador_id: estJulia.id, materia_id: matIA.id,    tema: "Árboles de decisión",         tipo: "virtual",    link_ubicacion: "https://meet.x/ia2",    fecha_hora: monthsAhead(2, 15), duracion_minutos: 120, cupos_max: 6, descripcion: "Entropía y ganancia",      requiere_aprobacion: false, cancelada: false },
      { creador_id: estMateo.id, materia_id: matIng.id,   tema: "Reading técnico",             tipo: "presencial", link_ubicacion: "Aula A02",              fecha_hora: monthsAhead(2, 19), duracion_minutos: 60,  cupos_max: 10,descripcion: "Comprensión de papers",    requiere_aprobacion: false, cancelada: false },
      { creador_id: estValen.id, materia_id: matRedes.id, tema: "Modelo OSI repaso",           tipo: "virtual",    link_ubicacion: "https://meet.x/red2",   fecha_hora: monthsAhead(2, 24), duracion_minutos: 90,  cupos_max: 7, descripcion: "Capas y protocolos",       requiere_aprobacion: false, cancelada: false },
      { creador_id: estLara.id,  materia_id: matBD.id,    tema: "Optimización de consultas",   tipo: "virtual",    link_ubicacion: "https://meet.x/bd3",    fecha_hora: monthsAhead(3, 2),  duracion_minutos: 90,  cupos_max: 6, descripcion: "Índices y EXPLAIN",        requiere_aprobacion: false, cancelada: false },
      { creador_id: estAna.id,   materia_id: matAlgo.id,  tema: "Complejidad algorítmica",     tipo: "presencial", link_ubicacion: "Aula C08",              fecha_hora: monthsAhead(3, 8),  duracion_minutos: 90,  cupos_max: 5, descripcion: "Notación Big-O",           requiere_aprobacion: true,  cancelada: false },
    ],
    { returning: true }
  );
  const [sesAlgo, sesBD1, sesPOO, sesBD2, sesPOO2, sesWeb, sesIA, sesRedes] = sesiones;

  // Inscripciones — al menos una sesión llena (sesAlgo: 5 aceptadas en 5 cupos)
  await db.inscripcion_sesion.bulkCreate([
    // sesAlgo: 5/5 = lleno
    { sesion_id: sesAlgo.id,  estudiante_id: estLara.id,  estado: "aceptada", fecha_inscripcion: monthsAgo(3, 5), notificado_recordatorio: true },
    { sesion_id: sesAlgo.id,  estudiante_id: estMateo.id, estado: "aceptada", fecha_inscripcion: monthsAgo(3, 6), notificado_recordatorio: true },
    { sesion_id: sesAlgo.id,  estudiante_id: estValen.id, estado: "aceptada", fecha_inscripcion: monthsAgo(3, 7), notificado_recordatorio: true },
    { sesion_id: sesAlgo.id,  estudiante_id: estTomas.id, estado: "aceptada", fecha_inscripcion: monthsAgo(3, 7), notificado_recordatorio: true },
    { sesion_id: sesAlgo.id,  estudiante_id: estSofia.id, estado: "aceptada", fecha_inscripcion: monthsAgo(3, 8), notificado_recordatorio: true },
    // sesBD1: 3/4
    { sesion_id: sesBD1.id,   estudiante_id: estFacu.id,  estado: "aceptada", fecha_inscripcion: monthsAgo(2, 1), notificado_recordatorio: true },
    { sesion_id: sesBD1.id,   estudiante_id: estJulia.id, estado: "aceptada", fecha_inscripcion: monthsAgo(2, 2), notificado_recordatorio: true },
    { sesion_id: sesBD1.id,   estudiante_id: estMateo.id, estado: "aceptada", fecha_inscripcion: monthsAgo(2, 3), notificado_recordatorio: true },
    // sesPOO: 4/6
    { sesion_id: sesPOO.id,   estudiante_id: estFacu.id,  estado: "aceptada", fecha_inscripcion: monthsAgo(1, 10), notificado_recordatorio: true },
    { sesion_id: sesPOO.id,   estudiante_id: estLara.id,  estado: "aceptada", fecha_inscripcion: monthsAgo(1, 11), notificado_recordatorio: true },
    { sesion_id: sesPOO.id,   estudiante_id: estSofia.id, estado: "aceptada", fecha_inscripcion: monthsAgo(1, 11), notificado_recordatorio: true },
    { sesion_id: sesPOO.id,   estudiante_id: estValen.id, estado: "aceptada", fecha_inscripcion: monthsAgo(1, 12), notificado_recordatorio: true },
    // sesBD2: 2/5
    { sesion_id: sesBD2.id,   estudiante_id: estLara.id,  estado: "aceptada", fecha_inscripcion: monthsAgo(0, 5), notificado_recordatorio: false },
    { sesion_id: sesBD2.id,   estudiante_id: estDiego.id, estado: "aceptada", fecha_inscripcion: monthsAgo(0, 6), notificado_recordatorio: false },
    // sesPOO2: 2/4 (1 pendiente)
    { sesion_id: sesPOO2.id,  estudiante_id: estFacu.id,  estado: "pendiente",fecha_inscripcion: monthsAgo(0, 8), notificado_recordatorio: false },
    { sesion_id: sesPOO2.id,  estudiante_id: estMateo.id, estado: "aceptada", fecha_inscripcion: monthsAgo(0, 8), notificado_recordatorio: false },
    { sesion_id: sesPOO2.id,  estudiante_id: estValen.id, estado: "aceptada", fecha_inscripcion: monthsAgo(0, 9), notificado_recordatorio: false },
    // sesWeb: 5/8
    { sesion_id: sesWeb.id,   estudiante_id: estFacu.id,  estado: "aceptada", fecha_inscripcion: monthsAgo(0, 10), notificado_recordatorio: false },
    { sesion_id: sesWeb.id,   estudiante_id: estLara.id,  estado: "aceptada", fecha_inscripcion: monthsAgo(0, 10), notificado_recordatorio: false },
    { sesion_id: sesWeb.id,   estudiante_id: estMateo.id, estado: "aceptada", fecha_inscripcion: monthsAgo(0, 11), notificado_recordatorio: false },
    { sesion_id: sesWeb.id,   estudiante_id: estTomas.id, estado: "aceptada", fecha_inscripcion: monthsAgo(0, 12), notificado_recordatorio: false },
    { sesion_id: sesWeb.id,   estudiante_id: estValen.id, estado: "aceptada", fecha_inscripcion: monthsAgo(0, 13), notificado_recordatorio: false },
    // sesIA: 3/6
    { sesion_id: sesIA.id,    estudiante_id: estDiego.id, estado: "aceptada", fecha_inscripcion: monthsAgo(0, 14), notificado_recordatorio: false },
    { sesion_id: sesIA.id,    estudiante_id: estAna.id,   estado: "aceptada", fecha_inscripcion: monthsAgo(0, 14), notificado_recordatorio: false },
    { sesion_id: sesIA.id,    estudiante_id: estSofia.id, estado: "aceptada", fecha_inscripcion: monthsAgo(0, 15), notificado_recordatorio: false },
    // sesRedes: 2/5
    { sesion_id: sesRedes.id, estudiante_id: estJulia.id, estado: "aceptada", fecha_inscripcion: monthsAgo(0, 16), notificado_recordatorio: false },
    { sesion_id: sesRedes.id, estudiante_id: estAna.id,   estado: "aceptada", fecha_inscripcion: monthsAgo(0, 17), notificado_recordatorio: false },
  ]);

  // 11. Notificaciones (algunas)
  await db.notificacion.bulkCreate([
    { usuario_id: uFacu.id,  tipo: "sesion_inscripcion", mensaje: "Tu sesión BD recibió inscripciones", referencia_tipo: "sesion_estudio", referencia_id: sesBD2.id, leida: false, created_at: monthsAgo(0, 5) },
    { usuario_id: uLara.id,  tipo: "contacto_aceptado",  mensaje: "Facundo aceptó tu solicitud",         referencia_tipo: "contacto",       referencia_id: 1,         leida: true,  created_at: monthsAgo(1) },
    { usuario_id: uAdmin.id, tipo: "denuncia_revisar",   mensaje: "Hay 4 denuncias pendientes",          referencia_tipo: "denuncia",       referencia_id: 1,         leida: false, created_at: monthsAgo(0, 3) },
  ]);

  console.log("✓ Seed completo");
}

seed()
  .catch((err) => {
    console.error("✗ Seed falló:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.sequelize.close();
  });
