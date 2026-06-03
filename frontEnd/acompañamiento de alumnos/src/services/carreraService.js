import { api } from "./api";

export const getCarreras = () => api.get("/carreras");

export const createCarrera = (payload) => api.post("/carreras", payload);

export const getMateriasAdmin = () => api.get("/admin/materias");
