import { api } from "./api";

export const buscarEstudiantesAdmin = (
  query = "",
  page = 1,
  limit = 5
) =>
  api.get(
    `/admin/home/students/search?q=${encodeURIComponent(
      query
    )}&page=${page}&limit=${limit}`
  );

export const cambiarEstadoEstudianteAdmin = (
  estudianteId,
  activo
) =>
  api.patch(
    `/admin/estudiantes/${estudianteId}/estado`,
    { activo }
  );
