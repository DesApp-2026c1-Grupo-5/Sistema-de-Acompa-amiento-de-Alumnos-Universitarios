export const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const parseTags = (raw) => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((t) => t.trim().replace(/^#/, '').toLowerCase())
    .filter(Boolean);
};

export const calcRatio = (likes = 0, dislikes = 0) => {
  const total = likes + dislikes;
  if (!total) return 100;
  return Math.round((likes / total) * 100);
};

export const initialsFromName = (name = '') => {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('');
};

export const validateUrl = (url) => {
  if (!url || !url.trim()) return 'Debes ingresar una URL válida.';
  try {
    const u = new URL(url.trim());
    if (!['http:', 'https:'].includes(u.protocol)) {
      return 'La URL debe comenzar con http:// o https://';
    }
    return '';
  } catch {
    return 'La URL no tiene un formato válido.';
  }
};

export const filterMaterials = (materials, { query = '', type = 'all' } = {}) => {
  const q = query.trim().toLowerCase();
  return materials.filter((m) => {
    if (type !== 'all' && m.type !== type) return false;
    if (!q) return true;
    const haystack = [
      m.title,
      m.subject,
      m.description,
      ...(m.tags || []),
      m.author?.name || '',
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
};
