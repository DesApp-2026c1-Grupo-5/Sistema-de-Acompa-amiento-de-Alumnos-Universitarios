require("dotenv").config();

const db = require("./src/db/models");
const {
  repararSituacionesAcademicas,
} = require("./src/services/saneamientoAcademico.service");

const main = async () => {
  const dryRun = !process.argv.includes("--apply");
  const report = await repararSituacionesAcademicas({ dryRun });
  console.log(JSON.stringify(report, null, 2));
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.sequelize.close();
  });
