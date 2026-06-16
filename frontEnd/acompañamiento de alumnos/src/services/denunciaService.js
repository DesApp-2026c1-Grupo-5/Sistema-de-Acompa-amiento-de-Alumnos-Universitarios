import { api } from "./api";

export const getMotivosDenuncia = () => api.get("/motivos-denuncia");

export const createDenuncia = (materialId, payload) =>
  api.post(`/materiales/${materialId}/denuncias`, payload);

export const createPostDenuncia = (postId, payload) =>
  api.post(`/posts/${postId}/denuncias`, payload);
