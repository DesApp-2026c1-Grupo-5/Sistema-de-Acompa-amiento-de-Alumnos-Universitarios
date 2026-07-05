import { api } from "./api";

/**
 * Busca estudiantes por nombre, apellido o email.
 * @param {string} query
 */
export const buscarEstudiantesAdmin = (query) =>
  api.get("/admin/home/students/search", {
    params: {
      q: query,
    },
  });