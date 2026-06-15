import { api } from "./api";

export const aceptarInvitacion = (id) =>
  api.patch(`/contactos/${id}/aceptar`);

export const ignorarInvitacion = (id) =>
  api.patch(`/contactos/${id}/ignorar`);

export const buscarUsuarios = (q = "") => {
  console.log("Buscando:", q);

  return api.get(
    `/contactos/buscar?q=${encodeURIComponent(q)}`
  );
};

export const enviarInvitacion = (estudianteId) =>
  api.post(`/contactos/invitar/${estudianteId}`);
