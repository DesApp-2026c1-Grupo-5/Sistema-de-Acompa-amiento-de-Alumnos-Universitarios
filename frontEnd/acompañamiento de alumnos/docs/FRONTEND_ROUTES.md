# Frontend - Sistema de Acompañamiento de Alumnos Universitarios

## Stack Tecnológico

- **Framework**: React 19.2.5
- **Build Tool**: Vite 8.0.9
- **Routing**: React Router DOM (v7)
- **Linting**: ESLint 9.39.4

## Estructura de Proyecto

```
src/
├── pages/
│   ├── public/           # Rutas públicas
│   │   ├── Landing.jsx    # Página principal sin sesión
│   │   └── Login.jsx     # Página de inicio de sesión
│   ├── student/          # Rutas para estudiantes
│   │   ├── HomeStudent.jsx
│   │   ├── Profile.jsx
│   │   ├── AcademicStatus.jsx
│   │   ├── AcademicAssistant.jsx
│   │   ├── StudySessions.jsx
│   │   └── Materials.jsx
│   └── admin/            # Rutas para administradores
│       ├── HomeAdmin.jsx
│       ├── Careers.jsx
│       ├── StudyPlan.jsx
│       ├── Reports.jsx
│       ├── Admins.jsx
│       └── Statistics.jsx
├── router/
│   └── AppRouter.jsx     # Configuración de rutas
├── components/           # Componentes reutilizables (pendiente)
└── main.jsx             # Punto de entrada
```

## Rutas Disponibles

| Path | Componente | Descripción |
|------|------------|-------------|
| `/` | Landing | Página principal sin sesión |
| `/login` | Login | Inicio de sesión |
| `/student/home` | HomeStudent | Home del estudiante |
| `/student/profile` | Profile | Perfil del estudiante |
| `/student/academic-status` | AcademicStatus | Situación académica |
| `/student/academic-assistant` | AcademicAssistant | Asistente académico |
| `/student/study-sessions` | StudySessions | Sesiones de estudio |
| `/student/materials` | Materials | Repositorio de materiales |
| `/admin/home` | HomeAdmin | Home del administrador |
| `/admin/careers` | Careers | Gestión de carreras |
| `/admin/study-plan` | StudyPlan | Configurar plan de estudio |
| `/admin/reports` | Reports | Moderación de denuncias |
| `/admin/admins` | Admins | Alta de administradores |
| `/admin/statistics` | Statistics | Estadísticas |

## Comandos

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Build de producción
npm run preview # Preview del build
npm run lint     # Verificar código
```

## Dependencias

### Producción
- `react`: ^19.2.5
- `react-dom`: ^19.2.5
- `react-router-dom`: ^7.x

### Desarrollo
- `@vitejs/plugin-react`: ^6.0.1
- `vite`: ^8.0.9
- `eslint`: ^9.39.4

## Notas

- Las páginas son placeholders y deben implementarse con la lógica real.
- No hay aún sistema de autenticación ni protección de rutas.
- No hay layouts comunes (navbar/sidebar) configurados.