require("dotenv").config();

const app = require("./app");
const db = require("./db/models");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await db.sequelize.sync();
    console.log(' DB conectada correctamente');

    console.log(' Tablas sincronizadas');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
};

startServer();