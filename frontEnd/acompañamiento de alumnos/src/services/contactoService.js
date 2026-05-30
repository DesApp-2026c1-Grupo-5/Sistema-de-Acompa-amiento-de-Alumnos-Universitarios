import { api } from "./api";

export const aceptarInvitacion = (id) => api.patch(`/contactos/${id}/aceptar`);

export const ignorarInvitacion = (id) => api.patch(`/contactos/${id}/ignorar`);
