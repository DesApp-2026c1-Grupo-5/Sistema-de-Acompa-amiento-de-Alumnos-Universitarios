const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

export const mapSessionFromApi = (s) => {
  const fecha = s.dateTime ? new Date(s.dateTime) : null;
  const date = fecha
    ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(
        fecha.getDate()
      ).padStart(2, "0")}`
    : "";
  const time = fecha
    ? `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`
    : "";
  const total = s.durationMinutes ?? 0;

  return {
    id: s.id,
    materiaId: s.materia_id,
    subject: s.subject ?? "Sin materia",
    topic: s.topic,
    type: s.type,
    linkUbicacion: s.link_ubicacion ?? "",
    date,
    time,
    durationHours: Math.floor(total / 60),
    durationMinutes: total % 60,
    maxParticipants: s.maxParticipants,
    participantsCount: s.participantsCount ?? 0,
    description: s.description ?? "",
    requiresApproval: s.requiresApproval,
    cancelled: s.cancelled,
    creatorId: s.creatorId,
    creatorName: s.creatorName ?? "Estudiante",
    creatorInitials: getInitials(s.creatorName),
    creatorImage: s.creatorImage ?? null,
    privacy: s.privacy ?? 'public',
    userStatus: s.userStatus,
    pendingRequests: s.pendingRequests ?? [],
    participants: (s.participants ?? []).map((p) => ({
      ...p,
      initials: getInitials(p.name),
      image: p.foto_url ?? null,
    })),
    archivos: (s.archivos ?? []).map((archivo) => ({
      id: archivo.id,
      nombreOriginal: archivo.nombreOriginal ?? archivo.nombre_original ?? "Archivo",
      nombreArchivo: archivo.nombreArchivo ?? archivo.nombre_archivo ?? "",
      mimeType: archivo.mimeType ?? archivo.mime_type ?? "",
      sizeBytes: archivo.sizeBytes ?? archivo.size_bytes ?? null,
      url: archivo.url ?? archivo.url_o_path ?? "",
      uploader: archivo.uploader ?? null,
      createdAt: archivo.createdAt ?? null,
    })),
  };
};
