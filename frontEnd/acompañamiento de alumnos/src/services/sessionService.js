import { api } from "./api";

export const getSessions = () => api.get("/sesiones?limit=50");

export const getSession = (id) => api.get(`/sesiones/${id}`);

export const createSession = (payload) => api.post("/sesiones", payload);

export const updateSession = (id, payload) => api.put(`/sesiones/${id}`, payload);

export const cancelSession = (id) => api.patch(`/sesiones/${id}/cancelar`);

export const joinSession = (id) => api.post(`/sesiones/${id}/inscripciones`);

export const approveParticipant = (sesionId, inscripcionId) =>
  api.patch(`/sesiones/${sesionId}/inscripciones/${inscripcionId}/aprobar`);

export const rejectParticipant = (sesionId, inscripcionId) =>
  api.patch(`/sesiones/${sesionId}/inscripciones/${inscripcionId}/rechazar`);

export const uploadSessionFiles = (sesionId, files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("archivos", file);
  });

  return api.postFormData(`/sesiones/${sesionId}/archivos`, formData);
};

export const deleteSessionFile = (sesionId, archivoId) =>
  api.delete(`/sesiones/${sesionId}/archivos/${archivoId}`);
