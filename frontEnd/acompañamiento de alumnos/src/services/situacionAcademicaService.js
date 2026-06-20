import { api } from "./api";

export const crearSituacion = (plan_id) => api.post("/student/academic-situation", { plan_id });

export const getSituacion = () => api.get("/student/academic-situation");

export const actualizarMaterias = (materias) => api.patch("/student/academic-situation/subjects", { materias });

export const crearFinal = (payload) => api.post("/student/academic-situation/finals", payload);

export const eliminarFinal = (id) => api.delete(`/student/academic-situation/finals/${id}`);

export const actualizarFinal = (id, payload) => api.patch(`/student/academic-situation/finals/${id}`, payload);

export const crearActividad = (payload) => api.post("/student/academic-situation/credits", payload);

export const eliminarActividad = (id) => api.delete(`/student/academic-situation/credits/${id}`);

export const importarExcel = (formData) => api.postFormData("/student/academic-situation/import-excel", formData);

export const confirmarImportacion = (materias, creditActivities = []) =>
  api.post("/student/academic-situation/confirm-excel", { materias, credit_activities: creditActivities });

export const cambiarCarrera = (plan_id) =>
  api.patch("/student/academic-situation/change-career", { plan_id });
