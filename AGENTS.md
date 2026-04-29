# AGENTS.md

## Project Locations

- **Frontend**: `frontEnd/acompañamiento de alumnos/`
- **Backend**: `backEnd/`
  - Express + Sequelize
  - Scripts: npm run dev (pendiente)

## Frontend Stack

- React 19.2.5 + Vite 8.0.9
- Routing: React Router DOM v7 (data router)
- Rutas configuradas en `src/router/AppRouter.jsx`
- Componentes en `src/components/`
- Páginas en `src/pages/{public,student,admin}/`

## Frontend Commands

```bash
npm run dev      # Desarrollo
npm run build    # Producción
npm run lint     # Verificar código
```

## Rutas Frontend

### Públicos
| Path | Descripción |
|------|-------------|
| `/` | Landing |
| `/login` | Login |

### Estudiantes
| Path | Descripción |
|------|-------------|
| `/student/home` | Home |
| `/student/profile` | Perfil |
| `/student/materials` | Materiales |
| `/student/material-repository` | Repositorio de materiales |
| `/student/study-sessions` | Sesiones de estudio |
| `/student/academic-status` | Estado académico |
| `/student/academic-assistant` | Asistente académico |

### Administradores
| Path | Descripción |
|------|-------------|
| `/admin/home` | Home |
| `/admin/study-plan` | Plan de estudios |
| `/admin/statistics` | Estadísticas |
| `/admin/reports` | Reportes |
| `/admin/careers` | Carreras |
| `/admin/admins` | Administradores |

## Componentes Implementados

- **common**: Button, Card, Avatar
- **landing**: LandingNavbar, HeroSection, FeaturesSection, FunctionalitiesSection, Footer
- **materials**: Header, Sidebar, SearchBar, Button, Badge, Modal, MaterialGrid, MaterialCard, MaterialDetailModal, UploadMaterialModal, ReportModal
- **navbar**: Navbar, StudentNavbar, AdminNavbar
- **profile**: ProfileHeader, PublicationsList, PendingRequests, ContactList
- **layouts**: Layout
- **header**: Header

## Colores Institucionales

- **Cian**: `#00bcd4` (principal - accent)
- **Verde Oscuro**: `#004d40` (texto headings)
- **Verde Agua**: `#00695c` (bordes accent)
- **Blanco**: `#ffffff` (fondo)

## Pendiente

- Backend API (estructura y endpoints)
- Sistema de autenticación (conexión frontend-backend)
- Tests configurados