const fs = require("fs");
const path = require("path");

const swaggerBase = require("./swagger.json");

function loadPaths() {
  const pathsDir = path.join(__dirname, "paths");
  const merged = {};

  if (!fs.existsSync(pathsDir)) return merged;

  const files = fs.readdirSync(pathsDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = path.join(pathsDir, file);
    const paths = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    Object.assign(merged, paths);
  }

  return merged;
}

const paths = loadPaths();

const swaggerSpec = {
  ...swaggerBase,
  paths,
};

module.exports = swaggerSpec;
