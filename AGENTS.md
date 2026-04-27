# AGENTS.md

## Project Locations

- **Frontend**: `frontEnd/acompañamiento de alumnos/`
- **Backend**: `backEnd/` (verificar estructura)

## Frontend Stack

- React 19.2.5 + Vite 8.0.9
- Routing: React Router DOM v7 (data router)
- Rutas configuradas en `src/router/AppRouter.jsx`
- Páginas placeholder en `src/pages/{public,student,admin}/`

## Frontend Commands

```bash
npm run dev      # Desarrollo
npm run build    # Producción
npm run lint     # Verificar código
```

## Rutas Frontend

| Path | Descripción |
|------|-------------|
| `/` | Landing |
| `/login` | Login |
| `/student/*` | 6 páginas para estudiantes |
| `/admin/*` | 6 páginas para administradores |

Ver `frontEnd/acompañamiento de alumnos/docs/FRONTEND_ROUTES.md` para detalle completo.

## Colores Institucionales

- **Cian**: `#00bcd4` (principal - accent)
- **Verde Oscuro**: `#004d40` (texto headings)
- **Verde Agua**: `#00695c` (bordes accent)
- **Blanco**: `#ffffff` (fondo)

## Pendiente

- Sistema de autenticación y protección de rutas
- Layouts (navbar/sidebar) para student/admin
- Conectar frontend con backend API
- Tests configurados