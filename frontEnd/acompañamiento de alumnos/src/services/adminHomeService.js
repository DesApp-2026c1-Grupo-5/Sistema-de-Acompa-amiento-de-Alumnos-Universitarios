import { api } from "./api";

export const getAdminHomeStats = () => api.get("/admin/home/stats");
