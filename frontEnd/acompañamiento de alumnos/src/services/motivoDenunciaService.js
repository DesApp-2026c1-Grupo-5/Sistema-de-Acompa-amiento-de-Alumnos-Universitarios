import { api } from "./api";

export const getMotivosAdmin = () => api.get("/admin/motivos-denuncia");

export const createMotivo = (descripcion) =>
  api.post("/admin/motivos-denuncia", { descripcion });

export const updateMotivo = (id, descripcion) =>
  api.put(`/admin/motivos-denuncia/${id}`, { descripcion });

export const deleteMotivo = (id) => api.delete(`/admin/motivos-denuncia/${id}`);
