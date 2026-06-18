import { api } from "./api";

export const getPlanEstudio = (id) => api.get(`/planes-estudio/${id}`);

export const addPlanEstudio = (carreraId, payload) =>
  api.post(`/carreras/${carreraId}/planes`, payload);

export const updatePlanEstudio = (id, payload) =>
  api.patch(`/planes-estudio/${id}`, payload);

export const savePlanEstudio = (id, payload) =>
  api.put(`/planes-estudio/${id}`, payload);
