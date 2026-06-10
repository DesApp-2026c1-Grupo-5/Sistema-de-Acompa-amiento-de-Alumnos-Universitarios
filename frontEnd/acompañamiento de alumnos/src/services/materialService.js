import { api } from "./api";

export const getMaterials = ({ page = 1, limit = 12, q = "", tipo = "all" } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (q.trim()) params.set("q", q.trim());
  if (tipo && tipo !== "all") params.set("tipo", tipo);
  return api.get(`/materiales?${params.toString()}`);
};

export const getMaterial = (id) => api.get(`/materiales/${id}`);

export const createMaterial = (payload) => api.post("/materiales", payload);

export const voteMaterial = (materialId, valor) =>
  api.post("/materiales/votar", { material_id: materialId, valor });

export const getMaterias = () => api.get("/materias");
