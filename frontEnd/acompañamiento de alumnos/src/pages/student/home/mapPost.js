export const getInitials = (nombre = "", apellido = "") =>
  `${nombre.trim()[0] ?? ""}${apellido.trim()[0] ?? ""}`.toUpperCase() || "?";

export const mapPostFromApi = (apiPost) => {
  const est = apiPost.estudiante ?? {};
  const nombre = est.nombre ?? "";
  const apellido = est.apellido ?? "";

  return {
    id: apiPost.id,
    type: "post",
    authorId: est.id ?? apiPost.estudiante_id,
    authorName: `${nombre} ${apellido}`.trim() || "Estudiante",
    authorInitials: getInitials(nombre, apellido),
    authorImage: est.foto_url ?? null,
    createdAt: apiPost.createdAt,
    content: apiPost.contenido,
    likes: apiPost.likes ?? 0,
    dislikes: apiPost.dislikes ?? 0,
    miVoto: apiPost.mi_voto ?? null,
  };
};
