import { api } from "./api";

export const getAdmins = () => api.get("/admins");

export const createAdmin = (nombre, apellido, email, password) =>
  api.post("/admins", { nombre, apellido, email, password });
