export const MATERIAL_TYPES = {
  FILE: 'file',
  VIDEO: 'video',
  LINK: 'link',
  DRIVE: 'drive',
  GITHUB: 'github',
  DISCORD: 'discord',
};

export const TYPE_LABELS = {
  file: 'Archivo',
  video: 'Video',
  link: 'Link',
  drive: 'Drive',
  github: 'GitHub',
  discord: 'Discord',
};

export const TYPE_OPTIONS = [
  { value: 'file', label: 'Archivo' },
  { value: 'link', label: 'Link' },
  { value: 'video', label: 'Video' },
  { value: 'drive', label: 'Drive' },
  { value: 'github', label: 'GitHub' },
  { value: 'discord', label: 'Discord' },
];

export const ALLOWED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'jpg',
  'png',
  'zip',
];

export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const FILE_ACCEPT = ALLOWED_EXTENSIONS.map((extension) => `.${extension}`).join(',');
