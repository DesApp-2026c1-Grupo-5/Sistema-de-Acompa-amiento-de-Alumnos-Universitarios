const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

export const mapCarreraFromApi = (c) => ({
  id: c.id,
  name: c.nombre,
  faculty: c.instituto,
  title: c.titulo,
  duration: `${c.duracion_anios} años`,
  plans: (c.planes ?? []).map((p) => ({
    id: p.id,
    year: p.anio,
    status: capitalize(p.estado),
  })),
});
