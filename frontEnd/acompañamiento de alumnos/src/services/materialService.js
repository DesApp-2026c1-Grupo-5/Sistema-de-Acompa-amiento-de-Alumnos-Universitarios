import { api } from "./api";

export const getMaterials = ({ page = 1, limit = 12, q = "", tipo = "all" } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (q.trim()) params.set("q", q.trim());
  if (tipo && tipo !== "all") params.set("tipo", tipo);
  return api.get(`/materiales?${params.toString()}`);
};

export const getMaterial = (id) => api.get(`/materiales/${id}`);

export const createMaterial = (payload) => {
  if (payload.tipo !== "file") return api.post("/materiales", payload);

  const formData = new FormData();
  formData.append("archivo", payload.archivo);
  formData.append("materia_id", String(payload.materia_id));
  formData.append("titulo", payload.titulo);
  formData.append("descripcion", payload.descripcion ?? "");
  formData.append("tags", JSON.stringify(payload.tags ?? []));
  return api.postFormData("/materiales/archivo", formData);
};

export const downloadMaterial = (id) => api.download(`/materiales/${id}/descarga`);

export const voteMaterial = (materialId, valor) =>
  api.post("/materiales/votar", { material_id: materialId, valor });

export const getMaterias = () => api.get("/materias");
