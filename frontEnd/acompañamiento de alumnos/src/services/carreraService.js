import { api } from "./api";

export const getCarreras = () => api.get("/carreras");

export const createCarrera = (payload) => api.post("/carreras", payload);

export const getMateriasAdmin = () => api.get("/admin/materias");

export const getCarrera = (id) => api.get(`/carreras/${id}`);

export const updateCarrera = (id, payload) => api.put(`/carreras/${id}`, payload);
