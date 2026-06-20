import { api } from "./api";

export const getAdmins = ({ page = 1, limit = 10 } = {}) =>
  api.get(`/admins?page=${page}&limit=${limit}`);

export const createAdmin = (nombre, apellido, email, password) =>
  api.post("/admins", { nombre, apellido, email, password });

export const deleteAdmin = (id) =>
  api.delete(`/admins/${id}`);
