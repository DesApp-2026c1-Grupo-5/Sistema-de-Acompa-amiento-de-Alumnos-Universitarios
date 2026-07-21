const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const COLUMNAS_ESPERADAS = [
  "materia",
  "estado",
  "anio",
  "cuatrimestre",
  "nota",
];

const ESTADOS_VALIDOS = ["pendiente", "cursando", "regular", "aprobada"];

const normalizarTexto = (texto) =>
  (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const esFormatoReporte = (workbook) => {
  const sheetName = workbook.SheetNames[0];
  return sheetName && sheetName.toLowerCase() === "reporte";
};

const extraerNombreMateria = (nombreCompleto) => {
  const match = nombreCompleto.match(/^(.+?)\s*\([\w_]+\)\s*$/);
  return match ? match[1].trim() : nombreCompleto.trim();
};

const inferirEstado = (nota) => {
  const n = (nota || "").trim();
  if (n.includes("Promocionado")) return "aprobada";
  if (n.includes("Aprobado")) return "aprobada";
  if (n.includes("Cursando")) return "cursando";
  if (n.includes("Regular")) return "regular";
  return "pendiente";
};

const extraerNotaNumerica = (nota) => {
  const match = (nota || "").trim().match(/^(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const parseReporteExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null, header: 1 });

  if (!data || data.length === 0) {
    throw new Error("El archivo Excel está vacío");
  }

  let inDataSection = false;
  const rows = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const col0 = String(row[0] || "").trim();

    if (col0 === "Actividad" && String(row[1] || "").trim() === "Tipo") {
      inDataSection = true;
      continue;
    }

    if (!inDataSection) continue;

    if (!col0) continue;

    const tipo = String(row[1] || "").trim();
    if (tipo !== "Materia") continue;

    const nombreCompleto = col0;
    const notaRaw = String(row[4] || "").trim();
    const origen = String(row[5] || "").trim();
    const creditos = row[6] !== null && row[6] !== undefined && row[6] !== "" ? Number(row[6]) : null;
    const anio = row[2] !== null && row[2] !== undefined && row[2] !== "" ? Number(row[2]) : null;

    const materiaName = extraerNombreMateria(nombreCompleto);
    const estado = inferirEstado(notaRaw);
    const notaNumerica = extraerNotaNumerica(notaRaw);

    const notaLower = notaRaw.toLowerCase();
    const esActividadCredito = creditos !== null && creditos > 0 && !anio &&
      (notaLower.includes("c (aprobado)") || notaLower.includes("actividad") || notaLower.includes("credito"));

    rows.push({
      rowNumber: i + 1,
      materia: materiaName,
      nombreCompleto,
      estado,
      anio,
      nota: notaNumerica,
      notaRaw,
      origen,
      creditos,
      esActividadCredito,
    });
  }

  if (rows.length === 0) {
    throw new Error("No se encontraron datos de materias en el archivo");
  }

  return rows;
};

const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("El archivo Excel no contiene hojas");
  }

  if (esFormatoReporte(workbook)) {
    return parseReporteExcel(filePath);
  }

  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });

  if (!data || data.length === 0) {
    throw new Error("El archivo Excel está vacío");
  }

  const rows = data.map((row, index) => ({
    rowNumber: index + 2,
    materia: String(row.materia || row.Materia || row.MATERIA || "").trim(),
    estado: String(row.estado || row.Estado || row.ESTADO || "").trim().toLowerCase(),
    anio: row.anio || row.Anio || row.ANIO || null,
    cuatrimestre: row.cuatrimestre || row.Cuatrimestre || row.CUATRIMESTRE || null,
    nota: row.nota ?? row.Nota ?? row.NOTA ?? null,
  }));

  return rows;
};

const validarFilas = (rows, materiasDelPlan) => {
  const mapaMaterias = new Map();
  for (const m of materiasDelPlan) {
    mapaMaterias.set(normalizarTexto(m.nombre), m);
  }

  const errors = [];
  const validRows = [];
  const materiasVistas = new Set();

  for (const row of rows) {
    const rowErrors = [];

    if (!row.materia) {
      rowErrors.push("El nombre de la materia es obligatorio");
    }

    const materiaMatch = row.materia ? mapaMaterias.get(normalizarTexto(row.materia)) : null;
    if (row.materia && !materiaMatch) {
      rowErrors.push(`La materia "${row.materia}" no existe en el plan de estudios`);
    }
    if (materiaMatch && materiasVistas.has(materiaMatch.id)) {
      rowErrors.push("La materia está duplicada en el archivo");
    }
    if (materiaMatch) materiasVistas.add(materiaMatch.id);

    if (!row.estado) {
      rowErrors.push("El estado es obligatorio");
    } else if (!ESTADOS_VALIDOS.includes(row.estado)) {
      rowErrors.push(`Estado "${row.estado}" no válido. Valores: ${ESTADOS_VALIDOS.join(", ")}`);
    }

    if (row.nota !== null && row.nota !== undefined && row.nota !== "") {
      const nota = Number(row.nota);
      if (Number.isNaN(nota) || nota < 0 || nota > 10) {
        rowErrors.push("La nota debe ser un número entre 0 y 10");
      }
    }

    if (row.anio !== null && row.anio !== undefined && row.anio !== "") {
      const anio = Number(row.anio);
      if (Number.isNaN(anio) || anio < 1) {
        rowErrors.push("El año debe ser un número positivo");
      }
    }

    if (row.cuatrimestre !== null && row.cuatrimestre !== undefined && row.cuatrimestre !== "") {
      const cuatri = Number(row.cuatrimestre);
      if (Number.isNaN(cuatri) || cuatri < 1 || cuatri > 2) {
        rowErrors.push("El cuatrimestre debe ser 1 o 2");
      }
    }

    if (rowErrors.length > 0) {
      errors.push({ row: row.rowNumber, materia: row.materia, errors: rowErrors });
    } else {
      validRows.push({
        materia_id: materiaMatch.id,
        estado: row.estado,
        anio: row.anio ? Number(row.anio) : null,
        cuatrimestre: row.cuatrimestre ? Number(row.cuatrimestre) : null,
        nota: row.nota !== null && row.nota !== undefined && row.nota !== ""
          ? Number(row.nota)
          : null,
      });
    }
  }

  return { errors, validRows };
};

const validarFilasReporte = (rows, materiasDelPlan) => {
  const mapaMaterias = new Map();
  for (const m of materiasDelPlan) {
    mapaMaterias.set(normalizarTexto(m.nombre), m);
  }

  const errors = [];
  const validRows = [];
  const creditActivities = [];
  const materiasVistas = new Set();

  for (const row of rows) {
    if (row.esActividadCredito) {
      creditActivities.push({
        descripcion: row.materia,
        creditos: row.creditos,
      });
      continue;
    }

    const rowErrors = [];
    const materiaMatch = row.materia ? mapaMaterias.get(normalizarTexto(row.materia)) : null;

    if (!materiaMatch) {
      rowErrors.push(`La materia "${row.nombreCompleto || row.materia}" no existe en el plan de estudios`);
    }
    if (materiaMatch && materiasVistas.has(materiaMatch.id)) {
      rowErrors.push("La materia está duplicada en el archivo");
    }
    if (materiaMatch) materiasVistas.add(materiaMatch.id);

    if (rowErrors.length > 0) {
      errors.push({ row: row.rowNumber, materia: row.materia, errors: rowErrors });
    } else {
      validRows.push({
        materia_id: materiaMatch.id,
        estado: row.estado,
        anio: row.anio || null,
        nota: row.nota ?? null,
      });
    }
  }

  return { errors, validRows, creditActivities };
};

const limpiarArchivo = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    /* ignorar errores de limpieza */
  }
};

module.exports = { parseExcel, validarFilas, validarFilasReporte, limpiarArchivo, normalizarTexto };
