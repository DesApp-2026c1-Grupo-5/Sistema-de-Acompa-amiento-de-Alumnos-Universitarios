const { readFileSync } = require("fs");
const { join } = require("path");

const TEMPLATES_DIR = join(__dirname, "..", "emailTemplates");

const templatesCache = {};

const loadTemplate = (name) => {
  if (!templatesCache[name]) {
    templatesCache[name] = readFileSync(join(TEMPLATES_DIR, `${name}.html`), "utf-8");
  }
  return templatesCache[name];
};

const renderSection = (template, variables) => {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(placeholder, value ?? "");
  }

  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
    return variables[key] ? content : "";
  });

  return result;
};

const renderTemplate = (templateName, variables) => {
  const baseHtml = loadTemplate("base");
  const contentHtml = loadTemplate(templateName);

  const contenidoRenderizado = renderSection(contentHtml, variables);

  return renderSection(baseHtml, {
    titulo: variables.titulo || "SIVA UNAHUR",
    contenido: contenidoRenderizado,
  });
};

module.exports = { renderTemplate };
