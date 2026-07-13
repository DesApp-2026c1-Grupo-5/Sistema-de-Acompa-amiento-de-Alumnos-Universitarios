process.env.NODE_ENV = "test";

const { Client } = require("pg");
const request = require("supertest");
const app = require("../app");
const db = require("../db/models");
const { hashPassword } = require("../utils/password");

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

const createPlanWithSubject = async ({ creditsRequired = 20, subjectCredits = 8 } = {}) => {
  const carrera = await db.carrera.create({
    nombre: `Carrera ${Date.now()} ${Math.random()}`,
    titulo: "Titulo",
    instituto: "Instituto",
    duracion_anios: 4,
  });
  const plan = await db.plan_estudio.create({
    carrera_id: carrera.id,
    nombre: "Plan test",
    anio: 2026,
    estado: "activo",
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
