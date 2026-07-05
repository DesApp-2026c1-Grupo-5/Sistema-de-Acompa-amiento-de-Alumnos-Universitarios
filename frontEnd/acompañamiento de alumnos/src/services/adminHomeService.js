import { api } from "./api";

export const buscarEstudiantesAdmin = (query) =>
  api.get(`/admin/home/students/search?q=${encodeURIComponent(query)}`);