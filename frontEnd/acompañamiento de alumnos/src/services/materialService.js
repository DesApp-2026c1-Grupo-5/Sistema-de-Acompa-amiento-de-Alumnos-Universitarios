import { api } from "./api";

export const getMaterials = () => api.get("/materiales?limit=50");

export const getMaterial = (id) => api.get(`/materiales/${id}`);

export const createMaterial = (payload) => api.post("/materiales", payload);

export const voteMaterial = (materialId, valor) =>
  api.post("/materiales/votar", { material_id: materialId, valor });

export const getMaterias = () => api.get("/materias");
