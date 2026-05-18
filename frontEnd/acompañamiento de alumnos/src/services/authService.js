import { api } from "./api";

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const register = (nombre_completo, email, password) =>
  api.post("/auth/register", { nombre_completo, email, password });

export const me = () => api.get("/auth/me");
