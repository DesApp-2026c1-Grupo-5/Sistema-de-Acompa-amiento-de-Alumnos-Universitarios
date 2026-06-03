import { api } from "./api";

export const getDenunciasStats = () => api.get("/admin/denuncias/stats");

export const getDenunciasAdmin = ({ q = "", estado = "todos", page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams({ estado, page, limit });
  if (q) params.set("q", q);
  return api.get(`/admin/denuncias?${params.toString()}`);
};

export const getDenunciaMaterialDetail = (materialId) =>
  api.get(`/admin/denuncias/material/${materialId}`);

export const verificarDenunciasMaterial = (materialId) =>
  api.patch(`/admin/materiales/${materialId}/denuncias/verificar`);

export const rechazarDenunciasMaterial = (materialId) =>
  api.patch(`/admin/materiales/${materialId}/denuncias/rechazar`);

export const suspenderMaterialAdmin = (materialId) =>
  api.patch(`/admin/materiales/${materialId}/suspender`);

export const restaurarMaterialAdmin = (materialId) =>
  api.patch(`/admin/materiales/${materialId}/restaurar`);
