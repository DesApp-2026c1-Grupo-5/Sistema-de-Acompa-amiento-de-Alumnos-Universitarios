import { initialsFromName } from "./helpers";

export const mapMaterialFromApi = (m) => {
  const est = m.estudiante ?? {};
  const name = `${est.nombre ?? ""} ${est.apellido ?? ""}`.trim() || "Estudiante";
  const uploadedFile = m.tipo === "file" && Boolean(m.archivo_subido);

  return {
    id: m.id,
    title: m.titulo,
    subject: m.materia?.nombre ?? "",
    description: m.descripcion ?? "",
    type: m.tipo,
    format: m.formato ?? m.tipo,
    sizeBytes: m.size_bytes ?? null,
    uploadedFile,
    downloadUrl: m.download_url ?? null,
    externalUrl: m.url_o_path ?? "",
    fileUrl: uploadedFile ? "" : (m.url_o_path ?? ""),
    discordData:
      m.tipo === "discord"
        ? { serverName: m.discord_servidor, channelName: m.discord_canal }
        : undefined,
    tags: (m.tags ?? []).map((t) => t.nombre),
    author: { id: est.id, name, initials: initialsFromName(name), image: est.foto_url ?? null },
    likes: m.likes ?? 0,
    dislikes: m.dislikes ?? 0,
    miVoto: m.mi_voto ?? null,
    miDenunciaPendiente: m.mi_denuncia_pendiente ?? false,
    publishedAt: m.createdAt,
  };
};
