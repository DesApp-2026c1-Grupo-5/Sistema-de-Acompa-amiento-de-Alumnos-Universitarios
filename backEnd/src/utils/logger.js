const levels = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = levels[process.env.LOG_LEVEL] ?? levels.info;

const timestamp = () =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

const log = (level, namespace, message, extra) => {
  if (levels[level] > currentLevel) return;
  const parts = [`[${timestamp()}]`, `[${level.toUpperCase()}]`, `[${namespace}]`, message];
  if (extra !== undefined) parts.push(JSON.stringify(extra));
  const output = parts.join(" ");
  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else console.log(output);
};

const logger = {
  error: (ns, msg, extra) => log("error", ns, msg, extra),
  warn: (ns, msg, extra) => log("warn", ns, msg, extra),
  info: (ns, msg, extra) => log("info", ns, msg, extra),
  debug: (ns, msg, extra) => log("debug", ns, msg, extra),
};

module.exports = logger;
