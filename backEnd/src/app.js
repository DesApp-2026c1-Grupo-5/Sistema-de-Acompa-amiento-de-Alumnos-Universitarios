const express = require("express");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const postRoutes = require("./routes/post.routes");
const materialRoutes = require("./routes/material.routes");
const inscripcionSesionRoutes = require("./routes/inscripcionSesion.routes");
const profileRoutes = require("./routes/profile.routes");
const sesionEstudioRoutes = require("./routes/sesionEstudio.routes");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", postRoutes);
app.use("/api", materialRoutes);
app.use("/api", inscripcionSesionRoutes);
app.use("/api", profileRoutes);
app.use("/api", sesionEstudioRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada",
  });
});

app.use(errorHandler);

module.exports = app;
