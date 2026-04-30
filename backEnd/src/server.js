require("dotenv").config();

const app = require("./app");
const { connectDB } = require('./db/config/database');

// Conectar DB y levantar server
const PORT = process.env.PORT || 3000;


const startServer = async () => {
  await connectDB();

  app.listen (PORT, () => {

    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
};

startServer();