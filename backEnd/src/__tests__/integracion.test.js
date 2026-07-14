process.env.NODE_ENV = "test";

const { Client } = require("pg");
const request = require("supertest");
const app = require("../app");
const db = require("../db/models");
const { hashPassword } = require("../utils/password");
const {
  repararSituacionesAcademicas,
} = require("../services/saneamientoAcademico.service");
const academicIntegrityMigration = require("../db/migrations/20260714000000-enforce-academic-integrity");

const PASSWORD = "Clave1234";

let emailCounter = 0;

const nextEmail = (prefix) => {
  emailCounter += 1;
  return `${prefix}${emailCounter}@unahur.edu`;
};

const registerStudent = async (prefix = "estudiante") => {
  const email = nextEmail(prefix);
  const res = await request(app)
    .post("/api/auth/register")
    .send({ nombre_completo: `Nombre ${prefix}`, email, password: PASSWORD })
    .expect(201);

  return { email, token: res.body.token, user: res.body.user };
};

const createAdmin = async (prefix = "admin") => {
  const email = nextEmail(prefix);
  const user = await db.usuario.create({
    email,
    password_hash: await hashPassword(PASSWORD),
    tipo: "administrador",
    activo: true,
  });
  const admin = await db.administrador.create({
    usuario_id: user.id,
    nombre: "Admin",
    apellido: prefix,
  });
  const login = await request(app)
    .post("/api/auth/login")
    .send({ email, password: PASSWORD })
    .expect(200);

  return { email, token: login.body.token, user, admin };
};

const createPlanWithSubject = async ({
  creditsRequired = 20,
  subjectCredits = 8,
  planStatus = "vigente",
  planName = "Plan test",
} = {}) => {
  const carrera = await db.carrera.create({
    nombre: `Carrera ${Date.now()} ${Math.random()}`,
    titulo: "Titulo",
    instituto: "Instituto",
    duracion_anios: 4,
  });
  const plan = await db.plan_estudio.create({
    carrera_id: carrera.id,
    nombre: planName,
    anio: 2026,
    estado: planStatus,
    creditos_requeridos: creditsRequired,
  });
  const materia = await db.materia.create({
    plan_id: plan.id,
    codigo: `MAT-${Date.now()}`,
    nombre: "Materia test",
    anio_cursada: 1,
    cuatrimestre: 1,
    tipo: "obligatoria",
    modalidad: "Cuatrimestral",
    carga_horaria_semanal: 4,
    es_optativa: false,
    es_unahur: false,
    creditos_otorga: subjectCredits,
  });

  return { carrera, plan, materia };
};

const createSubjectForPlan = (planId, name) =>
  db.materia.create({
    plan_id: planId,
    codigo: `MAT-${Date.now()}-${Math.random()}`,
    nombre: name,
    anio_cursada: 1,
    cuatrimestre: 1,
    tipo: "obligatoria",
    modalidad: "Cuatrimestral",
    carga_horaria_semanal: 4,
    es_optativa: false,
    es_unahur: false,
    creditos_otorga: 8,
  });

const createCorrelatedSubjects = async (tipo = "aprobar") => {
  const { plan, materia: requisito } = await createPlanWithSubject();
  const dependiente = await createSubjectForPlan(plan.id, "Materia dependiente");
  await db.correlatividad.create({
    materia_id: dependiente.id,
    materia_requisito_id: requisito.id,
    tipo,
  });

  return { plan, requisito, dependiente };
};

const profileAgeBoundary = () => {
  const argentinaDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(
    argentinaDate.filter(({ type }) => type !== "literal").map(({ type, value }) => [type, Number(value)])
  );
  const boundary = new Date(
    Date.UTC(dateParts.year - 16, dateParts.month - 1, dateParts.day)
  );
  const younger = new Date(boundary);
  younger.setUTCDate(younger.getUTCDate() + 1);

  return {
    boundary: boundary.toISOString().slice(0, 10),
    younger: younger.toISOString().slice(0, 10),
  };
};

const ensureTestDatabase = async () => {
  const database = process.env.DB_TEST_NAME;
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: "postgres",
  });

  await client.connect();
  const exists = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [database]
  );

  if (exists.rowCount === 0) {
    const safeName = database.replace(/"/g, '""');
    await client.query(`CREATE DATABASE "${safeName}"`);
  }

  await client.end();
};

describe("integracion backend", () => {
  beforeAll(async () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(db.sequelize.config.database).toBe(process.env.DB_TEST_NAME);
    await ensureTestDatabase();
    await db.sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test("registra un estudiante real", async () => {
    const email = nextEmail("registro");

    const res = await request(app)
      .post("/api/auth/register")
      .send({ nombre_completo: "Ana Perez", email, password: PASSWORD })
      .expect(201);

    const user = await db.usuario.findOne({ where: { email } });
    const student = await db.estudiante.findOne({ where: { usuario_id: user.id } });

    expect(res.body.token).toBeTruthy();
    expect(user.tipo).toBe("estudiante");
    expect(user.activo).toBe(true);
    expect(student.privacidad).toBe("publico");
    expect(student.email_visible).toBe(true);
  });

  test("rechaza registro con email duplicado", async () => {
    const email = nextEmail("duplicado");
    await request(app)
      .post("/api/auth/register")
      .send({ nombre_completo: "Ana Perez", email, password: PASSWORD })
      .expect(201);

    await request(app)
      .post("/api/auth/register")
      .send({ nombre_completo: "Ana Perez", email, password: PASSWORD })
      .expect(409);
  });

  test("el perfil propio muestra email aunque este oculto", async () => {
    const student = await registerStudent("propio");
    await request(app)
      .patch("/api/profile/me/privacy")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ email_visible: false })
      .expect(200);

    const res = await request(app)
      .get(`/api/profile/${student.user.estudiante.id}`)
      .set("Authorization", `Bearer ${student.token}`)
      .expect(200);

    expect(res.body.data.user.email).toBe(student.email);
  });

  test("el perfil ajeno oculta email cuando corresponde", async () => {
    const owner = await registerStudent("duenio");
    const viewer = await registerStudent("visitante");
    await request(app)
      .patch("/api/profile/me/privacy")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email_visible: false })
      .expect(200);

    const res = await request(app)
      .get(`/api/profile/${owner.user.estudiante.id}`)
      .set("Authorization", `Bearer ${viewer.token}`)
      .expect(200);

    expect(res.body.data.user.email).toBeNull();
  });

  test("actualiza, conserva y limpia los campos editables del perfil", async () => {
    const student = await registerStudent("editarperfil");

    const updated = await request(app)
      .put("/api/profile/me")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        nombre: "  Martina  ",
        apellido: "  Gómez  ",
        bio: "  Bio de prueba  ",
        localidad: "  Hurlingham  ",
        telefono: "  +54 (11) 4444-5555  ",
        fecha_nacimiento: "2000-02-29",
        pub_inscripciones: false,
        pub_regularizaciones: false,
        pub_aprobaciones: true,
      })
      .expect(200);

    expect(updated.body.data).toEqual(
      expect.objectContaining({
        nombre: "Martina",
        apellido: "Gómez",
        name: "Martina Gómez",
        bio: "Bio de prueba",
        localidad: "Hurlingham",
        location: "Hurlingham",
        telefono: "+54 (11) 4444-5555",
        phone: "+54 (11) 4444-5555",
        fecha_nacimiento: "2000-02-29",
        birthDate: "2000-02-29",
        pub_inscripciones: false,
        pub_regularizaciones: false,
        pub_aprobaciones: true,
      })
    );

    await request(app)
      .put("/api/profile/me")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ pub_aprobaciones: false })
      .expect(200);

    let persisted = await db.estudiante.findOne({ where: { usuario_id: student.user.id } });
    expect(persisted.localidad).toBe("Hurlingham");
    expect(persisted.telefono).toBe("+54 (11) 4444-5555");
    expect(persisted.fecha_nacimiento).toBe("2000-02-29");

    const cleared = await request(app)
      .put("/api/profile/me")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ bio: "  ", localidad: null, telefono: "", fecha_nacimiento: null })
      .expect(200);

    expect(cleared.body.data).toEqual(
      expect.objectContaining({
        bio: null,
        localidad: null,
        location: null,
        telefono: null,
        phone: null,
        fecha_nacimiento: null,
        birthDate: null,
      })
    );
    persisted = await db.estudiante.findOne({ where: { usuario_id: student.user.id } });
    expect(persisted.bio).toBeNull();
    expect(persisted.localidad).toBeNull();
    expect(persisted.telefono).toBeNull();
    expect(persisted.fecha_nacimiento).toBeNull();
  });

  test("devuelve todos los errores del perfil y rechaza campos desconocidos", async () => {
    const student = await registerStudent("erroresperfil");
    const res = await request(app)
      .put("/api/profile/me")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        nombre: "A",
        apellido: "B",
        telefono: "+54 abc",
        fecha_nacimiento: "2010-02-30",
        career: "No editable",
        email_visible: false,
      })
      .expect(400);

    const fields = res.body.details.map((detail) => detail.field);
    expect(fields).toEqual(
      expect.arrayContaining([
        "nombre",
        "apellido",
        "telefono",
        "fecha_nacimiento",
        "career",
        "email_visible",
      ])
    );
    expect(res.body.details).toHaveLength(6);
    expect(res.body.details.map((detail) => detail.message)).toEqual(
      expect.arrayContaining([
        "El nombre debe tener al menos 2 caracteres.",
        "El apellido debe tener al menos 2 caracteres.",
        "El teléfono solo puede contener dígitos, espacios, un + inicial, guiones y paréntesis.",
        "La fecha de nacimiento debe ser una fecha real.",
      ])
    );
  });

  test("valida límites de biografía, localidad y cantidad de dígitos del teléfono", async () => {
    const student = await registerStudent("limitesperfil");
    const res = await request(app)
      .put("/api/profile/me")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        bio: "b".repeat(501),
        localidad: "l".repeat(121),
        telefono: "123-4567",
      })
      .expect(400);

    expect(res.body.details.map((detail) => detail.field)).toEqual(
      expect.arrayContaining(["bio", "localidad", "telefono"])
    );

    const tooManyDigits = await request(app)
      .put("/api/profile/me")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ telefono: "1234567890123456" })
      .expect(400);
    expect(tooManyDigits.body.details[0].message).toBe(
      "El teléfono debe contener entre 8 y 15 dígitos."
    );
  });

  test("acepta exactamente 16 años y rechaza una fecha un día menor", async () => {
    const student = await registerStudent("edadperfil");
    const { boundary, younger } = profileAgeBoundary();

    await request(app)
      .put("/api/profile/me")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ fecha_nacimiento: boundary })
      .expect(200);

    const rejected = await request(app)
      .put("/api/profile/me")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ fecha_nacimiento: younger })
      .expect(400);

    expect(rejected.body.details).toEqual([
      expect.objectContaining({ field: "fecha_nacimiento", message: "Debes tener al menos 16 años." }),
    ]);
  });

  test("solo el GET propio expone teléfono y fecha de nacimiento", async () => {
    const owner = await registerStudent("privacidadperfil");
    const viewer = await registerStudent("visitaperfil");
    const admin = await createAdmin("adminperfil");

    await request(app)
      .put("/api/profile/me")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        localidad: "Morón",
        telefono: "+54 11 4444-5555",
        fecha_nacimiento: "2000-01-15",
      })
      .expect(200);

    const privacyUpdate = await request(app)
      .patch("/api/profile/me/privacy")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ pub_inscripciones: false })
      .expect(200);
    expect(privacyUpdate.body.data).not.toHaveProperty("phone");
    expect(privacyUpdate.body.data).not.toHaveProperty("telefono");
    expect(privacyUpdate.body.data).not.toHaveProperty("birthDate");
    expect(privacyUpdate.body.data).not.toHaveProperty("fecha_nacimiento");

    const own = await request(app)
      .get("/api/profile/me")
      .set("Authorization", `Bearer ${owner.token}`)
      .expect(200);
    expect(own.body.data.user).toEqual(
      expect.objectContaining({
        location: "Morón",
        phone: "+54 11 4444-5555",
        birthDate: "2000-01-15",
      })
    );

    for (const token of [owner.token, viewer.token, admin.token]) {
      const profile = await request(app)
        .get(`/api/profile/${owner.user.estudiante.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(profile.body.data.user.location).toBe("Morón");
      expect(profile.body.data.user).not.toHaveProperty("phone");
      expect(profile.body.data.user).not.toHaveProperty("birthDate");
    }

    await request(app)
      .patch("/api/profile/me/privacy")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ privacidad: "privado" })
      .expect(200);
    const privateProfile = await request(app)
      .get(`/api/profile/${owner.user.estudiante.id}`)
      .set("Authorization", `Bearer ${viewer.token}`)
      .expect(200);
    expect(privateProfile.body.data.privado).toBe(true);
    expect(privateProfile.body.data.user).not.toHaveProperty("location");
    expect(privateProfile.body.data.user).not.toHaveProperty("phone");
    expect(privateProfile.body.data.user).not.toHaveProperty("birthDate");
  });

  test("crea y elimina una publicacion propia", async () => {
    const student = await registerStudent("post");
    const created = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ contenido: "Publicacion de prueba" })
      .expect(201);

    await request(app)
      .delete(`/api/posts/${created.body.data.id}`)
      .set("Authorization", `Bearer ${student.token}`)
      .expect(200);

    const found = await db.post.findByPk(created.body.data.id);
    expect(found).toBeNull();
  });

  test("bloquea eliminar una publicacion ajena", async () => {
    const owner = await registerStudent("autor");
    const other = await registerStudent("otro");
    const created = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ contenido: "Publicacion ajena" })
      .expect(201);

    await request(app)
      .delete(`/api/posts/${created.body.data.id}`)
      .set("Authorization", `Bearer ${other.token}`)
      .expect(403);

    const found = await db.post.findByPk(created.body.data.id);
    expect(found).not.toBeNull();
  });

  test("crea situacion academica real", async () => {
    const student = await registerStudent("situacion");
    const { plan } = await createPlanWithSubject();

    const res = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    const situation = await db.situacion_academica.findByPk(res.body.data.id);
    expect(situation.plan_id).toBe(plan.id);
  });

  test("lista carreras con el nombre y estado de sus planes", async () => {
    const student = await registerStudent("listadocarreras");
    const { carrera, plan } = await createPlanWithSubject({ planName: "Plan 2026" });

    const res = await request(app)
      .get("/api/carreras")
      .set("Authorization", `Bearer ${student.token}`)
      .expect(200);

    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: carrera.id,
          planes: expect.arrayContaining([
            expect.objectContaining({
              id: plan.id,
              nombre: "Plan 2026",
              anio: 2026,
              estado: "vigente",
            }),
          ]),
        }),
      ])
    );
  });

  test("rechaza asociar una situacion a un plan discontinuado", async () => {
    const student = await registerStudent("plandiscontinuado");
    const { plan } = await createPlanWithSubject({ planStatus: "discontinuado" });

    const res = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(400);

    expect(res.body.message).toBe("El plan de estudio no está disponible para nuevas inscripciones");
    expect(await db.situacion_academica.count()).toBe(0);
  });

  test("cambia la situacion a otro plan habilitado", async () => {
    const student = await registerStudent("cambiocarrera");
    const { plan: originalPlan } = await createPlanWithSubject();
    const { plan: newPlan } = await createPlanWithSubject({ planStatus: "transicion" });

    const created = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: originalPlan.id })
      .expect(201);

    await request(app)
      .patch("/api/student/academic-situation/change-career")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: newPlan.id })
      .expect(200);

    const situation = await db.situacion_academica.findByPk(created.body.data.id);
    expect(situation.plan_id).toBe(newPlan.id);
  });

  test("no elimina la trayectoria al elegir nuevamente el mismo plan", async () => {
    const student = await registerStudent("mismoplan");
    const { plan } = await createPlanWithSubject();

    const created = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    const statesBefore = await db.estado_materia.count({
      where: { situacion_id: created.body.data.id },
    });

    await request(app)
      .patch("/api/student/academic-situation/change-career")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(409);

    const statesAfter = await db.estado_materia.count({
      where: { situacion_id: created.body.data.id },
    });
    expect(statesAfter).toBe(statesBefore);
  });

  test("indica que el asistente no está disponible sin situación académica", async () => {
    const student = await registerStudent("asistentesinsituacion");

    const res = await request(app)
      .get("/api/student/academic-assistant")
      .set("Authorization", `Bearer ${student.token}`)
      .expect(200);

    expect(res.body.data.availability).toEqual({
      canUse: false,
      reason: "NO_ACADEMIC_SITUATION",
    });
  });

  test("habilita el asistente después de asociar una carrera y plan", async () => {
    const student = await registerStudent("asistenteconsituacion");
    const { plan } = await createPlanWithSubject();

    await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    const res = await request(app)
      .get("/api/student/academic-assistant")
      .set("Authorization", `Bearer ${student.token}`)
      .expect(200);

    expect(res.body.data.availability).toEqual({
      canUse: true,
      reason: null,
    });
  });

  test("el simulador lista las materias cursando sin mezclar regulares ni pendientes", async () => {
    const student = await registerStudent("simuladorcursando");
    const { plan, materia: pendingSubject } = await createPlanWithSubject();
    const currentSubjects = await Promise.all([
      createSubjectForPlan(plan.id, "Cursando uno"),
      createSubjectForPlan(plan.id, "Cursando dos"),
      createSubjectForPlan(plan.id, "Cursando tres"),
    ]);
    const regularSubject = await createSubjectForPlan(plan.id, "Materia regular");

    await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    const update = await request(app)
      .patch("/api/student/academic-situation/subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        materias: [
          ...currentSubjects.map((subject) => ({
            materia_id: subject.id,
            estado: "cursando",
          })),
          { materia_id: regularSubject.id, estado: "regular" },
        ],
      })
      .expect(200);

    expect(update.body.data.every((result) => result.success)).toBe(true);

    const assistant = await request(app)
      .get("/api/student/academic-assistant")
      .set("Authorization", `Bearer ${student.token}`)
      .expect(200);

    expect(assistant.body.data.studentStatus.inProgressIds).toEqual(
      expect.arrayContaining(currentSubjects.map((subject) => subject.id))
    );
    expect(assistant.body.data.studentStatus.inProgressIds).toHaveLength(3);
    expect(assistant.body.data.studentStatus.regularizedIds).toEqual([
      regularSubject.id,
    ]);

    const planSubjects = await request(app)
      .get("/api/student/academic-assistant/plan-subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .expect(200);

    const simulatorCurrentSubjects = planSubjects.body.data.simulatorSubjects
      .filter((subject) => subject.status === "cursando");
    expect(simulatorCurrentSubjects).toEqual(
      expect.arrayContaining(
        currentSubjects.map((subject) =>
          expect.objectContaining({ id: subject.id, name: subject.nombre })
        )
      )
    );
    expect(simulatorCurrentSubjects).toHaveLength(3);
    expect(planSubjects.body.data.simulatorSubjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: regularSubject.id, status: "regular" }),
        expect.objectContaining({ id: pendingSubject.id, status: "pendiente" }),
      ])
    );

    const plannerSubjectIds = planSubjects.body.data.subjects.map(
      (subject) => subject.id
    );
    expect(plannerSubjectIds).toContain(pendingSubject.id);
    expect(plannerSubjectIds).not.toContain(regularSubject.id);
    currentSubjects.forEach((subject) => {
      expect(plannerSubjectIds).not.toContain(subject.id);
    });
  });

  test("tipo cursar exige correlativa regular o aprobada y evalua el lote completo", async () => {
    const student = await registerStudent("correlativacursar");
    const { plan, requisito, dependiente } = await createCorrelatedSubjects("cursar");
    const situation = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    const rejected = await request(app)
      .patch("/api/student/academic-situation/subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ materias: [{ materia_id: dependiente.id, estado: "cursando" }] })
      .expect(409);

    expect(rejected.body.code).toBe("CORRELATIVIDADES_INCUMPLIDAS");
    expect(rejected.body.details.violations).toEqual([
      expect.objectContaining({
        materia_id: dependiente.id,
        materia_requisito_id: requisito.id,
        tipo: "cursar",
        estado_requisito_proyectado: "pendiente",
      }),
    ]);

    await request(app)
      .patch("/api/student/academic-situation/subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        materias: [
          { materia_id: dependiente.id, estado: "cursando" },
          { materia_id: requisito.id, estado: "regular" },
        ],
      })
      .expect(200);

    const states = await db.estado_materia.findAll({
      where: { situacion_id: situation.body.data.id },
      raw: true,
    });
    const bySubject = new Map(states.map((state) => [state.materia_id, state.estado]));
    expect(bySubject.get(requisito.id)).toBe("regular");
    expect(bySubject.get(dependiente.id)).toBe("cursando");
  });

  test("tipo aprobar rechaza correlativa regular y acepta aprobacion conjunta", async () => {
    const student = await registerStudent("correlativaaprobar");
    const { plan, requisito, dependiente } = await createCorrelatedSubjects("aprobar");
    await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    await request(app)
      .patch("/api/student/academic-situation/subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ materias: [{ materia_id: requisito.id, estado: "regular" }] })
      .expect(200);

    await request(app)
      .post(`/api/materias/${dependiente.id}/inscribir`)
      .set("Authorization", `Bearer ${student.token}`)
      .send({})
      .expect(409);

    await request(app)
      .patch("/api/student/academic-situation/subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        materias: [
          { materia_id: dependiente.id, estado: "regular" },
          { materia_id: requisito.id, estado: "aprobada" },
        ],
      })
      .expect(200);
  });

  test("rechaza una regresion que invalida dependientes sin guardar cambios parciales", async () => {
    const student = await registerStudent("regresioncorrelativa");
    const { plan, requisito, dependiente } = await createCorrelatedSubjects("aprobar");
    const independiente = await createSubjectForPlan(plan.id, "Materia independiente");
    const situation = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    await request(app)
      .patch("/api/student/academic-situation/subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        materias: [
          { materia_id: requisito.id, estado: "aprobada" },
          { materia_id: dependiente.id, estado: "cursando" },
        ],
      })
      .expect(200);

    await request(app)
      .patch("/api/student/academic-situation/subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        materias: [
          { materia_id: requisito.id, estado: "pendiente" },
          { materia_id: independiente.id, estado: "aprobada" },
        ],
      })
      .expect(409);

    const states = await db.estado_materia.findAll({
      where: { situacion_id: situation.body.data.id },
      raw: true,
    });
    const bySubject = new Map(states.map((state) => [state.materia_id, state.estado]));
    expect(bySubject.get(requisito.id)).toBe("aprobada");
    expect(bySubject.get(dependiente.id)).toBe("cursando");
    expect(bySubject.get(independiente.id)).toBe("pendiente");
  });

  test("rechaza materias de otro plan", async () => {
    const student = await registerStudent("materiaotroplan");
    const { plan } = await createPlanWithSubject();
    const { materia: materiaExterna } = await createPlanWithSubject();
    await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    const response = await request(app)
      .patch("/api/student/academic-situation/subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ materias: [{ materia_id: materiaExterna.id, estado: "cursando" }] })
      .expect(400);

    expect(response.body.code).toBe("MATERIA_FUERA_DEL_PLAN");
  });

  test("un final no puede aprobar una materia con correlativas incumplidas", async () => {
    const student = await registerStudent("finalcorrelativa");
    const { plan, dependiente } = await createCorrelatedSubjects("aprobar");
    const situation = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);
    const estado = await db.estado_materia.findOne({
      where: { situacion_id: situation.body.data.id, materia_id: dependiente.id },
    });

    await request(app)
      .post("/api/student/academic-situation/finals")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        estado_materia_id: estado.id,
        fecha: "2026-07-12",
        nota: 8,
        aprobado: true,
      })
      .expect(409);

    expect(await db.final.count({ where: { estado_materia_id: estado.id } })).toBe(0);
    await estado.reload();
    expect(estado.estado).toBe("pendiente");
  });

  test("eliminar el ultimo final aprobado respeta dependientes y revierte todo", async () => {
    const student = await registerStudent("eliminarfinalcorrelativa");
    const { plan, requisito, dependiente } = await createCorrelatedSubjects("aprobar");
    const situation = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);
    const estadoRequisito = await db.estado_materia.findOne({
      where: { situacion_id: situation.body.data.id, materia_id: requisito.id },
    });

    const createdFinal = await request(app)
      .post("/api/student/academic-situation/finals")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        estado_materia_id: estadoRequisito.id,
        fecha: "2026-07-12",
        nota: 8,
        aprobado: true,
      })
      .expect(201);

    const manualRegression = await request(app)
      .patch("/api/student/academic-situation/subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ materias: [{ materia_id: requisito.id, estado: "regular" }] })
      .expect(409);
    expect(manualRegression.body.code).toBe("FINAL_APROBADO_VIGENTE");

    await request(app)
      .patch("/api/student/academic-situation/subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ materias: [{ materia_id: dependiente.id, estado: "cursando" }] })
      .expect(200);

    await request(app)
      .delete(`/api/student/academic-situation/finals/${createdFinal.body.data.id}`)
      .set("Authorization", `Bearer ${student.token}`)
      .expect(409);

    expect(await db.final.findByPk(createdFinal.body.data.id)).not.toBeNull();
    await estadoRequisito.reload();
    expect(estadoRequisito.estado).toBe("aprobada");
  });

  test("confirmar Excel revierte tambien los creditos ante una correlativa invalida", async () => {
    const student = await registerStudent("excelcorrelativa");
    const { plan, dependiente } = await createCorrelatedSubjects("aprobar");
    const situation = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    await request(app)
      .post("/api/student/academic-situation/confirm-excel")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        materias: [{ materia_id: dependiente.id, estado: "aprobada" }],
        credit_activities: [{ descripcion: "Curso externo", creditos: 2 }],
      })
      .expect(409);

    expect(
      await db.actividad_credito.count({ where: { situacion_id: situation.body.data.id } })
    ).toBe(0);
  });

  test("sanea en cascada, elimina evidencia y quita materias de otro plan", async () => {
    const student = await registerStudent("saneamientocorrelativas");
    const { plan, requisito, dependiente } = await createCorrelatedSubjects("aprobar");
    const tercera = await createSubjectForPlan(plan.id, "Tercera materia");
    await db.correlatividad.create({
      materia_id: tercera.id,
      materia_requisito_id: dependiente.id,
      tipo: "aprobar",
    });
    const { materia: materiaExterna } = await createPlanWithSubject();
    const situation = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    const estados = await db.estado_materia.findAll({
      where: { situacion_id: situation.body.data.id },
    });
    const bySubject = new Map(estados.map((state) => [state.materia_id, state]));
    await bySubject.get(dependiente.id).update({
      estado: "aprobada",
      anio: 2025,
      cuatrimestre: 1,
      nota: 8,
      fecha: new Date("2025-07-01"),
    });
    await bySubject.get(tercera.id).update({
      estado: "aprobada",
      anio: 2026,
      cuatrimestre: 1,
      nota: 9,
      fecha: new Date("2026-07-01"),
    });
    await db.final.bulkCreate([
      {
        estado_materia_id: bySubject.get(dependiente.id).id,
        fecha: new Date("2025-07-01"),
        nota: 8,
        aprobado: true,
      },
      {
        estado_materia_id: bySubject.get(tercera.id).id,
        fecha: new Date("2026-07-01"),
        nota: 9,
        aprobado: true,
      },
    ]);
    const estadoExterno = await db.estado_materia.create({
      situacion_id: situation.body.data.id,
      materia_id: materiaExterna.id,
      estado: "aprobada",
      nota: 10,
    });

    const report = await repararSituacionesAcademicas();

    expect(report.estados_fuera_del_plan_eliminados).toBe(1);
    expect(report.materias_reseteadas).toBe(2);
    expect(report.finales_eliminados).toBe(2);
    expect(await db.estado_materia.findByPk(estadoExterno.id)).toBeNull();
    for (const materiaId of [dependiente.id, tercera.id]) {
      const state = await db.estado_materia.findOne({
        where: { situacion_id: situation.body.data.id, materia_id: materiaId },
      });
      expect(state).toEqual(
        expect.objectContaining({
          estado: "pendiente",
          anio: null,
          cuatrimestre: null,
          nota: null,
          fecha: null,
        })
      );
      expect(await db.final.count({ where: { estado_materia_id: state.id } })).toBe(0);
    }
    expect((await db.estado_materia.findOne({
      where: { situacion_id: situation.body.data.id, materia_id: requisito.id },
    })).estado).toBe("pendiente");
  });

  test("admin crea y consulta correlativas conservando su tipo", async () => {
    const admin = await createAdmin("correlativasadmin");
    const carrera = await db.carrera.create({
      nombre: "Carrera correlativas",
      titulo: "Titulo",
      instituto: "Instituto",
      duracion_anios: 4,
    });

    const created = await request(app)
      .post(`/api/carreras/${carrera.id}/planes`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        anio: 2027,
        estado: "vigente",
        creditos_requeridos: 20,
        niveles_ingles_requeridos: 1,
        materias: [
          {
            codigo: "MAT-1",
            nombre: "Matematica I",
            anio_cursada: 1,
            modalidad: "Cuatrimestral",
            es_optativa: false,
            es_unahur: false,
            creditos_otorga: 8,
            correlativas: [],
          },
          {
            codigo: "MAT-2",
            nombre: "Matematica II",
            anio_cursada: 1,
            modalidad: "Cuatrimestral",
            es_optativa: false,
            es_unahur: false,
            creditos_otorga: 8,
            correlativas: [{ codigo: "MAT-1", tipo: "aprobar" }],
          },
        ],
      })
      .expect(201);

    const fetched = await request(app)
      .get(`/api/planes-estudio/${created.body.data.id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .expect(200);
    const matematicaDos = fetched.body.data.materias.find(
      (subject) => subject.codigo === "MAT-2"
    );
    expect(matematicaDos.correlativas).toEqual([
      { codigo: "MAT-1", tipo: "aprobar" },
    ]);
  });

  test("renombrar el codigo conserva la materia y bloquea bajas con trayectoria", async () => {
    const admin = await createAdmin("renombremateria");
    const student = await registerStudent("trayectoriamateria");
    const { plan, materia } = await createPlanWithSubject();
    const situation = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    await request(app)
      .put(`/api/planes-estudio/${plan.id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        estado: "vigente",
        creditos_requeridos: plan.creditos_requeridos,
        niveles_ingles_requeridos: plan.niveles_ingles_requeridos || 0,
        materias_unahur: 0,
        materias: [
          {
            id: materia.id,
            codigo: "MAT-RENOMBRADA",
            nombre: materia.nombre,
            anio_cursada: materia.anio_cursada,
            modalidad: materia.modalidad,
            es_optativa: false,
            es_unahur: false,
            creditos_otorga: materia.creditos_otorga,
            correlativas: [],
          },
        ],
      })
      .expect(200);

    const renamed = await db.materia.findByPk(materia.id);
    expect(renamed.codigo).toBe("MAT-RENOMBRADA");
    expect(await db.estado_materia.count({
      where: { situacion_id: situation.body.data.id, materia_id: materia.id },
    })).toBe(1);

    await request(app)
      .put(`/api/planes-estudio/${plan.id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        estado: "vigente",
        creditos_requeridos: plan.creditos_requeridos,
        niveles_ingles_requeridos: plan.niveles_ingles_requeridos || 0,
        materias_unahur: 0,
        materias: [],
      })
      .expect(409);
    expect(await db.materia.findByPk(materia.id)).not.toBeNull();
  });

  test("endurecer una correlativa desde admin sanea la trayectoria existente", async () => {
    const admin = await createAdmin("endurecercorrelativa");
    const student = await registerStudent("saneamientoadmin");
    const { plan, requisito, dependiente } = await createCorrelatedSubjects("cursar");
    const situation = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);
    await request(app)
      .patch("/api/student/academic-situation/subjects")
      .set("Authorization", `Bearer ${student.token}`)
      .send({
        materias: [
          { materia_id: requisito.id, estado: "regular" },
          { materia_id: dependiente.id, estado: "cursando" },
        ],
      })
      .expect(200);

    await request(app)
      .put(`/api/planes-estudio/${plan.id}/materias/${dependiente.id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ correlativas: [{ codigo: requisito.codigo, tipo: "aprobar" }] })
      .expect(200);

    const estadoDependiente = await db.estado_materia.findOne({
      where: { situacion_id: situation.body.data.id, materia_id: dependiente.id },
    });
    expect(estadoDependiente).toEqual(
      expect.objectContaining({
        estado: "pendiente",
        anio: null,
        cuatrimestre: null,
        nota: null,
        fecha: null,
      })
    );
  });

  test("la migracion de integridad academica es compatible con el esquema de modelos", async () => {
    const queryInterface = db.sequelize.getQueryInterface();

    const student = await registerStudent("migracionacademica");
    const { plan, materia } = await createPlanWithSubject();
    const situation = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);
    await db.sequelize.query(
      `UPDATE estado_materia SET estado = 'regularizada' WHERE situacion_id = :situacionId AND materia_id = :materiaId`,
      { replacements: { situacionId: situation.body.data.id, materiaId: materia.id } }
    );

    await academicIntegrityMigration.up(queryInterface, db.Sequelize);

    const estadoConstraints = await queryInterface.showConstraint("estado_materia");
    const correlatividadConstraints = await queryInterface.showConstraint("correlatividads");
    expect(estadoConstraints.map((item) => item.constraintName)).toContain(
      "estado_materias_estado_valido"
    );
    expect(correlatividadConstraints.map((item) => item.constraintName)).toEqual(
      expect.arrayContaining([
        "correlatividads_tipo_valido",
        "correlatividads_sin_autorreferencia",
      ])
    );
    expect((await db.estado_materia.findOne({
      where: { situacion_id: situation.body.data.id, materia_id: materia.id },
    })).estado).toBe("regular");
  });

  test("crea actividad pendiente sin sumar creditos", async () => {
    const student = await registerStudent("creditospendientes");
    const { plan } = await createPlanWithSubject({ creditsRequired: 10 });
    await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    await request(app)
      .post("/api/student/academic-situation/credits")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ descripcion: "Actividad", creditos: 5, fecha: "2026-07-12", estado: "pendiente" })
      .expect(201);

    const res = await request(app)
      .get("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .expect(200);

    expect(res.body.data.stats.credits_obtained).toBe(0);
  });

  test("actividad aprobada suma creditos", async () => {
    const student = await registerStudent("creditosaprobados");
    const { plan } = await createPlanWithSubject({ creditsRequired: 10 });
    await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);

    const activity = await request(app)
      .post("/api/student/academic-situation/credits")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ descripcion: "Actividad", creditos: 5, fecha: "2026-07-12", estado: "pendiente" })
      .expect(201);

    await request(app)
      .patch(`/api/student/academic-situation/credits/${activity.body.data.id}`)
      .set("Authorization", `Bearer ${student.token}`)
      .send({ estado: "aprobada" })
      .expect(200);

    const res = await request(app)
      .get("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .expect(200);

    expect(res.body.data.stats.credits_obtained).toBe(5);
  });

  test("estadisticas admin informan materias aprobadas por carrera", async () => {
    const admin = await createAdmin("statsadmin");
    const student = await registerStudent("statsalumno");
    const { plan, materia } = await createPlanWithSubject();
    const situation = await request(app)
      .post("/api/student/academic-situation")
      .set("Authorization", `Bearer ${student.token}`)
      .send({ plan_id: plan.id })
      .expect(201);
    await db.estado_materia.update(
      { estado: "aprobada", anio: 2026, cuatrimestre: 1, nota: 8, fecha: new Date("2026-07-12") },
      { where: { situacion_id: situation.body.data.id, materia_id: materia.id } }
    );

    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${admin.token}`)
      .expect(200);

    expect(res.body.data.usoSistema.materiasAprobadasPorCarrera).toEqual(
      expect.arrayContaining([expect.objectContaining({ approved: 1 })])
    );
  });

  test("admin elimina otro administrador", async () => {
    const admin = await createAdmin("adminprincipal");
    const target = await createAdmin("adminborrar");

    await request(app)
      .delete(`/api/admins/${target.admin.id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .expect(200);

    expect(await db.administrador.findByPk(target.admin.id)).toBeNull();
    expect(await db.usuario.findByPk(target.user.id)).toBeNull();
  });

  test("admin inexistente devuelve 404 al eliminar", async () => {
    const admin = await createAdmin("admin404");

    await request(app)
      .delete("/api/admins/9999")
      .set("Authorization", `Bearer ${admin.token}`)
      .expect(404);
  });
});
