const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const postRoutes = require("./routes/post.routes");
const materialRoutes = require("./routes/material.routes");
const materiaRoutes = require("./routes/materia.routes");
const estadoMateriaRoutes = require("./routes/estadoMateria.routes");
const inscripcionSesionRoutes = require("./routes/inscripcionSesion.routes");
const profileRoutes = require("./routes/profile.routes");
const sesionEstudioRoutes = require("./routes/sesionEstudio.routes");
const sesionArchivoRoutes = require("./routes/sesionArchivo.routes");
const contactoRoutes = require("./routes/contacto.routes");
const notificacionRoutes = require("./routes/notificacion.routes");
const denunciaRoutes = require("./routes/denuncia.routes");
const denunciaAdminRoutes = require("./routes/denunciaAdmin.routes");
const carreraRoutes = require("./routes/carrera.routes");
const planEstudioRoutes = require("./routes/planEstudio.routes");
const motivoDenunciaRoutes = require("./routes/motivoDenuncia.routes");
const statsRoutes = require("./routes/stats.routes");
const academicAssistantRoutes = require("./routes/academicAssistant.routes");
const situacionAcademicaRoutes = require("./routes/situacionAcademica.routes");
const planCursadaRoutes = require("./routes/planCursada.routes");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", postRoutes);
app.use("/api", materialRoutes);
app.use("/api", materiaRoutes);
app.use("/api", estadoMateriaRoutes);
app.use("/api", inscripcionSesionRoutes);
app.use("/api", profileRoutes);
app.use("/api", sesionEstudioRoutes);
app.use("/api", sesionArchivoRoutes);
app.use("/api", contactoRoutes);
app.use("/api", notificacionRoutes);
app.use("/api", denunciaRoutes);
app.use("/api", denunciaAdminRoutes);
app.use("/api", carreraRoutes);
app.use("/api", planEstudioRoutes);
app.use("/api", motivoDenunciaRoutes);
app.use("/api", statsRoutes);
app.use("/api", academicAssistantRoutes);
app.use("/api", situacionAcademicaRoutes);
app.use("/api", planCursadaRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "API - Sistema de Acompañamiento"
}));

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada",
  });
});

app.use(errorHandler);

module.exports = app;
