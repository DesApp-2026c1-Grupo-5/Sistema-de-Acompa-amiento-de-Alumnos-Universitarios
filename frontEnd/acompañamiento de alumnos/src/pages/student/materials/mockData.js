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

export const REPORT_REASONS = [
  { value: 'inappropriate', label: 'Contenido inapropiado' },
  { value: 'offensive', label: 'Lenguaje ofensivo' },
  { value: 'copyright', label: 'Derechos de autor' },
  { value: 'spam', label: 'Spam' },
  { value: 'incorrect', label: 'Información incorrecta' },
  { value: 'other', label: 'Otro' },
];

export const SUBJECTS = [
  'Algoritmos y Estructuras',
  'Base de Datos',
  'Programación I',
  'Programación II',
  'Programación III',
  'Sistemas Operativos',
  'Redes',
  'Ingeniería de Software',
  'Matemática Discreta',
  'Análisis Matemático',
];

export const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'png', 'zip',
];

export const MAX_FILE_SIZE_MB = 25;

export const initialMaterials = [
  {
    id: 1,
    title: 'Guía completa de Árboles Binarios',
    subject: 'Algoritmos y Estructuras',
    description:
      'Guía teórica y práctica sobre árboles binarios, AVL y recorridos.',
    type: 'file',
    format: 'pdf',
    fileUrl: '/files/arboles-binarios.pdf',
    fileName: 'arboles-binarios.pdf',
    tags: ['árboles', 'estructuras', 'teoría'],
    author: { id: 101, name: 'María López', initials: 'ML' },
    likes: 45,
    dislikes: 2,
    downloads: 214,
    views: 532,
    publishedAt: '2026-04-20T10:30:00Z',
  },
  {
    id: 2,
    title: 'Normalización de Bases de Datos - Video explicativo',
    subject: 'Base de Datos',
    description:
      'Video tutorial sobre las formas normales y cómo aplicarlas.',
    type: 'video',
    format: 'youtube',
    externalUrl: 'https://youtube.com/watch?v=abc123',
    tags: ['normalización', 'bases de datos', 'sql'],
    author: { id: 102, name: 'Carlos Rodríguez', initials: 'CR' },
    likes: 32,
    dislikes: 1,
    downloads: 0,
    views: 418,
    publishedAt: '2026-04-18T15:00:00Z',
  },
  {
    id: 3,
    title: 'Servidor de Discord - Programación III',
    subject: 'Programación III',
    description: 'Comunidad para resolver dudas y compartir proyectos.',
    type: 'discord',
    format: 'invite-link',
    externalUrl: 'https://discord.gg/programacion3',
    discordData: {
      serverName: 'Programación III 2026',
      channelName: 'general',
      members: 348,
    },
    tags: ['comunidad', 'consultas', 'proyectos'],
    author: { id: 103, name: 'Ana Martínez', initials: 'AM' },
    likes: 89,
    dislikes: 3,
    downloads: 0,
    views: 1260,
    publishedAt: '2026-04-15T18:00:00Z',
  },
  {
    id: 4,
    title: 'Repositorio de ejercicios resueltos',
    subject: 'Algoritmos y Estructuras',
    description:
      'Colección de ejercicios de parciales anteriores con soluciones.',
    type: 'github',
    format: 'repository',
    externalUrl: 'https://github.com/user/ejercicios-estructuras',
    tags: ['ejercicios', 'parciales', 'práctica'],
    author: { id: 104, name: 'Pedro Silva', initials: 'PS' },
    likes: 67,
    dislikes: 0,
    downloads: 0,
    views: 875,
    publishedAt: '2026-04-12T09:20:00Z',
  },
  {
    id: 5,
    title: 'Drive compartido de apuntes - Programación II',
    subject: 'Programación II',
    description:
      'Carpeta compartida con apuntes de clase, resúmenes y prácticas.',
    type: 'drive',
    format: 'folder',
    externalUrl: 'https://drive.google.com/drive/folders/abc123xyz',
    tags: ['apuntes', 'resúmenes', 'cuatrimestre'],
    author: { id: 105, name: 'Lucía Fernández', initials: 'LF' },
    likes: 54,
    dislikes: 1,
    downloads: 0,
    views: 612,
    publishedAt: '2026-04-10T11:45:00Z',
  },
  {
    id: 6,
    title: 'GitHub - Ejercicios resueltos en Java',
    subject: 'Programación I',
    description:
      'Repositorio público con ejercicios resueltos en Java, organizados por temas.',
    type: 'github',
    format: 'repository',
    externalUrl: 'https://github.com/user/java-exercises',
    tags: ['java', 'poo', 'ejercicios'],
    author: { id: 106, name: 'Sebastián Torres', initials: 'ST' },
    likes: 41,
    dislikes: 2,
    downloads: 0,
    views: 489,
    publishedAt: '2026-04-08T16:10:00Z',
  },
];
