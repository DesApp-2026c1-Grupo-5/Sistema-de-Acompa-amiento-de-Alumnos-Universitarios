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

export const getDenunciaPostDetail = (postId) =>
  api.get(`/admin/denuncias/post/${postId}`);

export const verificarDenunciasPost = (postId) =>
  api.patch(`/admin/posts/${postId}/denuncias/verificar`);

export const rechazarDenunciasPost = (postId) =>
  api.patch(`/admin/posts/${postId}/denuncias/rechazar`);

export const ocultarPostAdmin = (postId) =>
  api.patch(`/admin/posts/${postId}/ocultar`);

export const mostrarPostAdmin = (postId) =>
  api.patch(`/admin/posts/${postId}/mostrar`);

export const rechazarDenuncia = (denunciaId) =>
  api.patch(`/admin/denuncias/${denunciaId}/rechazar`);
