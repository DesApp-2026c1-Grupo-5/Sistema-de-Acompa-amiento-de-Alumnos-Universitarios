const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function hoursAgo(n) {
  return new Date(Date.now() - n * HOUR).toISOString();
}

function daysAgo(n) {
  return new Date(Date.now() - n * DAY).toISOString();
}

export const currentUser = {
  id: 1,
  name: 'Federico García',
  initials: 'FG',
  career: 'Ingeniería en Informática',
};

export const publications = [
  {
    id: 1,
    type: 'post',
    authorId: 2,
    authorName: 'María López',
    authorInitials: 'ML',
    createdAt: hoursAgo(2),
    content: '¡Acabo de terminar mi proyecto final de Programación III! Fue un desafío enorme pero muy gratificante. ¿Alguien más está trabajando en React?',
    likes: 15,
    dislikes: 0,
  },
  {
    id: 2,
    type: 'event',
    eventType: 'enrollment',
    eventSubject: 'Programación II',
    authorId: 3,
    authorName: 'Juan Pérez',
    authorInitials: 'JP',
    createdAt: hoursAgo(3),
    content: 'se inscribió a Programación II',
    likes: 8,
    dislikes: 0,
  },
  {
    id: 3,
    type: 'event',
    eventType: 'approved',
    eventSubject: 'Matemática I',
    authorId: 4,
    authorName: 'María Gómez',
    authorInitials: 'MG',
    createdAt: hoursAgo(6),
    content: 'aprobó Matemática I con 9',
    likes: 28,
    dislikes: 0,
  },
  {
    id: 4,
    type: 'event',
    eventType: 'regular',
    eventSubject: 'Física',
    authorId: 5,
    authorName: 'Pedro Núñez',
    authorInitials: 'PN',
    createdAt: daysAgo(1),
    content: 'regularizó Física',
    likes: 9,
    dislikes: 0,
  },
  {
    id: 5,
    type: 'post',
    authorId: 6,
    authorName: 'Lucía Fernández',
    authorInitials: 'LF',
    createdAt: daysAgo(2),
    content: 'Armamos un grupo de estudio para el final de Algoritmos. Si te suma, comentá y te paso el link.',
    likes: 18,
    dislikes: 0,
  },
];

export const upcomingSessions = [
  {
    id: 1,
    subject: 'Algoritmos y Estructuras',
    topic: 'Árboles binarios y recorridos',
    date: '2026-05-15',
    time: '18:00',
    participantsCount: 8,
    maxParticipants: 10,
  },
  {
    id: 2,
    subject: 'Base de Datos',
    topic: 'Normalización',
    date: '2026-05-17',
    time: '16:00',
    participantsCount: 12,
    maxParticipants: 15,
  },
  {
    id: 3,
    subject: 'Redes',
    topic: 'Modelo OSI',
    date: '2026-05-19',
    time: '19:00',
    participantsCount: 5,
    maxParticipants: 10,
  },
  {
    id: 4,
    subject: 'Programación III',
    topic: 'Patrones de diseño',
    date: '2026-05-21',
    time: '17:30',
    participantsCount: 10,
    maxParticipants: 12,
  },
];
