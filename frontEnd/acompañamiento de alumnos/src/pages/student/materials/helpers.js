import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB } from './mockData';

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

export const validateFile = (file) => {
  if (!file) return 'Debes seleccionar un archivo.';
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_FILE_SIZE_MB) {
    return `El archivo supera el tamaño máximo de ${MAX_FILE_SIZE_MB} MB.`;
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return `Extensión no permitida. Usa: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}.`;
  }
  return '';
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

export const buildNewMaterial = ({
  title,
  subject,
  type,
  description,
  tags,
  url,
  file,
  user = { id: 999, name: 'Franco González', initials: 'FG' },
}) => {
  const base = {
    id: Date.now(),
    title: title.trim(),
    subject: subject.trim(),
    description: (description || '').trim(),
    type,
    tags: parseTags(tags),
    author: user,
    likes: 0,
    dislikes: 0,
    downloads: 0,
    views: 0,
    publishedAt: new Date().toISOString(),
  };
  if (type === 'file') {
    return {
      ...base,
      format: file?.name?.split('.').pop()?.toLowerCase() || 'file',
      fileName: file?.name || '',
      fileUrl: file ? URL.createObjectURL(file) : '',
    };
  }
  return {
    ...base,
    format: type,
    externalUrl: url.trim(),
  };
};
