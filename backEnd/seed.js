/**
 * Seed de la base de datos SIVA UNAHUR.
 * Carga 2-5 registros por entidad
 * Ejecutar con: `node seed.js` desde backEnd/.
 */
require("dotenv").config();
const db = require("./src/db/models");

// Placeholder fijo: bcrypt aún no está instalado y el login real usa DEMO_USER.
// Reemplazar cuando el flujo de auth pase a leer la tabla `usuarios`.
const PASSWORD_HASH_PLACEHOLDER = "$2b$10$placeholder.hash.no.real.usar.solo.seed";

async function seed() {
  // 1. Reset de esquema. Destruye TODAS las tablas y las recrea vacías.
  await db.sequelize.sync({ force: true });
  console.log("· Esquema sincronizado");

  // 2. Estructura académica
  const [carreraTPI, carreraLicSI] = await db.carrera.bulkCreate(
    [
      { nombre: "Tecnicatura en Programación Informática", titulo: "Técnico/a Universitario/a", instituto: "UNAHUR", duracion_anios: 3 },
      { nombre: "Licenciatura en Sistemas",                 titulo: "Licenciado/a en Sistemas", instituto: "UNAHUR", duracion_anios: 5 },
    ],
    { returning: true }
  );

  const [planTPI2024, planLic2023] = await db.plan_estudio.bulkCreate(
    [
      { carrera_id: carreraTPI.id,   nombre: "TPI 2024",     estado: "vigente", creditos_requeridos: 60,  niveles_ingles_requeridos: 1 },
      { carrera_id: carreraLicSI.id, nombre: "Lic SI 2023",  estado: "vigente", creditos_requeridos: 120, niveles_ingles_requeridos: 2 },
    ],
    { returning: true }
  );

  const [matAlgo, matBD, matPOO, matRedes] = await db.materia.bulkCreate(
    [
      { plan_id: planTPI2024.id, nombre: "Algoritmos I",   anio_cursada: 1, tipo: "obligatoria", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, nombre: "Bases de Datos", anio_cursada: 2, tipo: "obligatoria", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planTPI2024.id, nombre: "POO",            anio_cursada: 2, tipo: "obligatoria", carga_horaria_semanal: 6, creditos_otorga: 8, es_optativa: false, es_unahur: true },
      { plan_id: planLic2023.id, nombre: "Redes",          anio_cursada: 3, tipo: "obligatoria", carga_horaria_semanal: 4, creditos_otorga: 6, es_optativa: false, es_unahur: true },
    ],
    { returning: true }
  );

  await db.correlatividad.bulkCreate([
    { materia_id: matBD.id,  materia_requisito_id: matAlgo.id, tipo: "cursar" },
    { materia_id: matPOO.id, materia_requisito_id: matAlgo.id, tipo: "aprobar" },
  ]);

  await db.oferta_academica.bulkCreate([
    { materia_id: matAlgo.id, anio: 2026, cuatrimestre: 1, turno: "noche",  aula: "A12", docente: "Pérez" },
    { materia_id: matBD.id,   anio: 2026, cuatrimestre: 1, turno: "tarde",  aula: "B07", docente: "Gómez" },
    { materia_id: matPOO.id,  anio: 2026, cuatrimestre: 2, turno: "mañana", aula: "C03", docente: "Ramírez" },
  ]);

  // 3. Identidad: primero los usuarios, luego sus perfiles (admin/estudiante).
  const [uAdmin, uEst1, uEst2, uEst3] = await db.usuario.bulkCreate(
    [
      { email: "admin@demo.com",   password_hash: PASSWORD_HASH_PLACEHOLDER, tipo: "administrador", activo: true  },
      { email: "facu@alumno.com",  password_hash: PASSWORD_HASH_PLACEHOLDER, tipo: "estudiante",    activo: true  },
      { email: "lara@alumno.com",  password_hash: PASSWORD_HASH_PLACEHOLDER, tipo: "estudiante",    activo: true  },
      { email: "diego@alumno.com", password_hash: PASSWORD_HASH_PLACEHOLDER, tipo: "estudiante",    activo: false },
    ],
    { returning: true }
  );

  const [admin1] = await db.administrador.bulkCreate(
    [{ usuario_id: uAdmin.id, nombre: "Sofía", apellido: "Operadora", creado_por: null }],
    { returning: true }
  );

  const [estFacu, estLara, estDiego] = await db.estudiante.bulkCreate(
    [
      { usuario_id: uEst1.id, nombre: "Facundo", apellido: "Torres", privacidad: "publico",   pub_inscripciones: true,  pub_regularizaciones: true,  pub_aprobaciones: true  },
      { usuario_id: uEst2.id, nombre: "Lara",    apellido: "Méndez", privacidad: "contactos", pub_inscripciones: true,  pub_regularizaciones: false, pub_aprobaciones: true  },
      { usuario_id: uEst3.id, nombre: "Diego",   apellido: "Ríos",   privacidad: "privado",   pub_inscripciones: false, pub_regularizaciones: false, pub_aprobaciones: false },
    ],
    { returning: true }
  );

  // 4. Catálogo de motivos de denuncia (referenciado por denuncias).
  const motivos = await db.motivo_denuncia.bulkCreate(
    [
      { descripcion: "Contenido inapropiado",  activo: true },
      { descripcion: "Material con copyright", activo: true },
      { descripcion: "Spam o publicidad",      activo: true },
    ],
    { returning: true }
  );

  // 5. Trayectoria académica del estudiante
  const [sitFacu, sitLara, sitDiego] = await db.situacion_academica.bulkCreate(
    [
      { estudiante_id: estFacu.id,  plan_id: planTPI2024.id, fecha_inicio: new Date("2024-03-01") },
      { estudiante_id: estLara.id,  plan_id: planTPI2024.id, fecha_inicio: new Date("2024-03-01") },
      { estudiante_id: estDiego.id, plan_id: planLic2023.id, fecha_inicio: new Date("2023-08-01") },
    ],
    { returning: true }
  );

  const [emFacuAlgo, , , emDiegoRedes] = await db.estado_materia.bulkCreate(
    [
      { situacion_id: sitFacu.id,  materia_id: matAlgo.id,  estado: "aprobada", anio: 2024, cuatrimestre: 1, nota: 9,    fecha: new Date("2024-07-15") },
      { situacion_id: sitFacu.id,  materia_id: matBD.id,    estado: "cursando", anio: 2026, cuatrimestre: 1, nota: null, fecha: null                    },
      { situacion_id: sitLara.id,  materia_id: matAlgo.id,  estado: "regular",  anio: 2024, cuatrimestre: 2, nota: 7,    fecha: new Date("2024-12-10") },
      { situacion_id: sitDiego.id, materia_id: matRedes.id, estado: "aprobada", anio: 2024, cuatrimestre: 2, nota: 8,    fecha: new Date("2024-12-20") },
    ],
    { returning: true }
  );

  await db.final.bulkCreate([
    { estado_materia_id: emFacuAlgo.id,   fecha: new Date("2024-07-15"), nota: 9, aprobado: true },
    { estado_materia_id: emDiegoRedes.id, fecha: new Date("2024-12-20"), nota: 8, aprobado: true },
  ]);

  await db.actividad_credito.bulkCreate([
    { situacion_id: sitFacu.id,  descripcion: "Curso de inglés A2",      creditos: 2, fecha: new Date("2025-06-01"), comprobante_url: "https://example.com/c1.pdf" },
    { situacion_id: sitFacu.id,  descripcion: "Hackathon UNAHUR",        creditos: 1, fecha: new Date("2025-09-10"), comprobante_url: null                          },
    { situacion_id: sitDiego.id, descripcion: "Voluntariado tecnológico", creditos: 3, fecha: new Date("2024-10-05"), comprobante_url: null                          },
  ]);

  const [pcFacu, pcLara] = await db.plan_cursada.bulkCreate(
    [
      { situacion_id: sitFacu.id, nombre: "Plan 2026 Facu", activo: true, created_at: new Date() },
      { situacion_id: sitLara.id, nombre: "Plan 2026 Lara", activo: true, created_at: new Date() },
    ],
    { returning: true }
  );

  await db.plan_cursada_item.bulkCreate([
    { plan_id: pcFacu.id, materia_id: matBD.id,  anio_proyectado: 2026, cuatrimestre_proyectado: 1 },
    { plan_id: pcFacu.id, materia_id: matPOO.id, anio_proyectado: 2026, cuatrimestre_proyectado: 2 },
    { plan_id: pcLara.id, materia_id: matBD.id,  anio_proyectado: 2026, cuatrimestre_proyectado: 1 },
    { plan_id: pcLara.id, materia_id: matPOO.id, anio_proyectado: 2026, cuatrimestre_proyectado: 2 },
  ]);

  // 6. Repositorio de materiales: tags + materiales + asociación N:N + valoraciones + denuncia
  const [tagApunte, tagParcial, tagVideo] = await db.tag.bulkCreate(
    [{ nombre: "apunte" }, { nombre: "parcial" }, { nombre: "video" }],
    { returning: true }
  );

  const [matResumen, matVideoPOO, matLinkDiscord, matParcialBD] = await db.material.bulkCreate(
    [
      { materia_id: matAlgo.id, estudiante_id: estFacu.id,  tipo: "archivo", titulo: "Resumen Algoritmos I",       descripcion: "Resumen completo del cuatri",   url_o_path: "/uploads/resumen-algo.pdf", formato: "pdf", size_bytes: 245000, suspendido: false, created_at: new Date() },
      { materia_id: matPOO.id,  estudiante_id: estLara.id,  tipo: "link",    titulo: "Video clase 3 - POO",        descripcion: "Grabación de la clase",         url_o_path: "https://youtube.com/x",     formato: "url", subtipo_link: "youtube", size_bytes: null, suspendido: false, created_at: new Date() },
      { materia_id: matBD.id,   estudiante_id: estFacu.id,  tipo: "discord", titulo: "Servidor estudio BD",        descripcion: "Canal con consultas resueltas", url_o_path: null,                         formato: null,  discord_servidor: "UNAHUR-BD", discord_canal: "general", size_bytes: null, suspendido: false, created_at: new Date() },
      { materia_id: matBD.id,   estudiante_id: estDiego.id, tipo: "archivo", titulo: "Parcial 1 BD 2024 resuelto", descripcion: "Resolución completa",           url_o_path: "/uploads/parcial-bd.pdf",   formato: "pdf", size_bytes: 180000, suspendido: false, created_at: new Date() },
    ],
    { returning: true }
  );

  // material_tag se llena con el mixin auto-generado por belongsToMany.
  await matResumen.addTags([tagApunte.id]);
  await matVideoPOO.addTags([tagVideo.id]);
  await matParcialBD.addTags([tagApunte.id, tagParcial.id]);

  await db.valoracion.bulkCreate([
    { material_id: matResumen.id,   estudiante_id: estLara.id,  valor: "util",    fecha: new Date() },
    { material_id: matResumen.id,   estudiante_id: estDiego.id, valor: "util",    fecha: new Date() },
    { material_id: matVideoPOO.id,  estudiante_id: estFacu.id,  valor: "util",    fecha: new Date() },
    { material_id: matParcialBD.id, estudiante_id: estFacu.id,  valor: "no_util", fecha: new Date() },
  ]);

  const [denuncia1] = await db.denuncia.bulkCreate(
    [{ material_id: matLinkDiscord.id, denunciante_id: estLara.id, motivo_id: motivos[2].id, admin_revisor_id: admin1.id, detalle: "Parece spam", estado: "pendiente", fecha_creacion: new Date(), fecha_resolucion: null }],
    { returning: true }
  );

  // 7. Social: contactos, posts y sesiones de estudio con sus inscripciones.
  const [contactoAceptado] = await db.contacto.bulkCreate(
    [
      { estudiante_solicitante_id: estFacu.id,  estudiante_receptor_id: estLara.id, estado: "aceptado",  fecha_solicitud: new Date("2025-04-01"), fecha_respuesta: new Date("2025-04-02") },
      { estudiante_solicitante_id: estDiego.id, estudiante_receptor_id: estFacu.id, estado: "pendiente", fecha_solicitud: new Date("2026-04-20"), fecha_respuesta: null                       },
    ],
    { returning: true }
  );

  await db.post.bulkCreate([
    { estudiante_id: estFacu.id, contenido: "Aprobé Algoritmos!",                            created_at: new Date("2024-07-16") },
    { estudiante_id: estLara.id, contenido: "Buscando grupo de estudio para BD",             created_at: new Date("2026-04-10") },
    { estudiante_id: estFacu.id, contenido: "Subí un resumen, lo encuentran en materiales", created_at: new Date("2026-04-25") },
  ]);

  const [sesBD, sesPOO] = await db.sesion_estudio.bulkCreate(
    [
      { creador_id: estFacu.id, materia_id: matBD.id,  tema: "Repaso normalización", tipo: "virtual",    link_ubicacion: "https://meet.x/abc", fecha_hora: new Date("2026-05-10T19:00:00"), duracion_minutos: 90, cupos_max: 5, descripcion: "Vamos a repasar 1FN-3FN", requiere_aprobacion: false, cancelada: false },
      { creador_id: estLara.id, materia_id: matPOO.id, tema: "Práctica herencia",    tipo: "presencial", link_ubicacion: "Aula C03",           fecha_hora: new Date("2026-05-12T17:00:00"), duracion_minutos: 60, cupos_max: 4, descripcion: null,                       requiere_aprobacion: true,  cancelada: false },
    ],
    { returning: true }
  );

  await db.inscripcion_sesion.bulkCreate([
    { sesion_id: sesBD.id,  estudiante_id: estLara.id,  estado: "aceptada",  fecha_inscripcion: new Date(), notificado_recordatorio: false },
    { sesion_id: sesBD.id,  estudiante_id: estDiego.id, estado: "aceptada",  fecha_inscripcion: new Date(), notificado_recordatorio: false },
    { sesion_id: sesPOO.id, estudiante_id: estFacu.id,  estado: "pendiente", fecha_inscripcion: new Date(), notificado_recordatorio: false },
  ]);

  // 8. Notificaciones (referencia polimórfica: referencia_tipo + referencia_id, sin FK real).
  await db.notificacion.bulkCreate([
    { usuario_id: uEst1.id,  tipo: "sesion_inscripcion", mensaje: "Tu sesión BD recibió una inscripción", referencia_tipo: "sesion_estudio", referencia_id: sesBD.id,            leida: false, created_at: new Date() },
    { usuario_id: uEst2.id,  tipo: "contacto_aceptado",  mensaje: "Facundo aceptó tu solicitud",          referencia_tipo: "contacto",       referencia_id: contactoAceptado.id, leida: true,  created_at: new Date() },
    { usuario_id: uEst3.id,  tipo: "denuncia",           mensaje: "Tu denuncia fue registrada",           referencia_tipo: "denuncia",       referencia_id: denuncia1.id,        leida: false, created_at: new Date() },
    { usuario_id: uAdmin.id, tipo: "denuncia_revisar",   mensaje: "Hay una denuncia pendiente",           referencia_tipo: "denuncia",       referencia_id: denuncia1.id,        leida: false, created_at: new Date() },
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
