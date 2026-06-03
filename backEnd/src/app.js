const express = require("express");
const path = require("path");

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

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada",
  });
});

app.use(errorHandler);

module.exports = app;
