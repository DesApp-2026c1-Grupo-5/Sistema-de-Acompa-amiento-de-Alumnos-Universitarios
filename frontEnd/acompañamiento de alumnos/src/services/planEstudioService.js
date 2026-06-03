import { api } from "./api";

export const getPlanEstudio = (id) => api.get(`/planes-estudio/${id}`);
