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

const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("El archivo Excel no contiene hojas");
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
    nota: row.nota || row.Nota || row.NOTA || null,
  }));

  return rows;
};

const validarFilas = (rows, materiasDelPlan) => {
  const mapaMaterias = new Map();
  for (const m of materiasDelPlan) {
    mapaMaterias.set(m.nombre.toLowerCase().trim(), m);
  }

  const errors = [];
  const validRows = [];

  for (const row of rows) {
    const rowErrors = [];

    if (!row.materia) {
      rowErrors.push("El nombre de la materia es obligatorio");
    }

    const materiaMatch = row.materia ? mapaMaterias.get(row.materia.toLowerCase()) : null;
    if (row.materia && !materiaMatch) {
      rowErrors.push(`La materia "${row.materia}" no existe en el plan de estudios`);
    }

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
        nota: row.nota ? Number(row.nota) : null,
      });
    }
  }

  return { errors, validRows };
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

module.exports = { parseExcel, validarFilas, limpiarArchivo };
