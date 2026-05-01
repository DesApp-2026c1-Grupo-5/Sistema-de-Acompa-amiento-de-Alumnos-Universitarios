# AGENTS.md

## Commands
```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build
npm run preview # Preview production build
npm run lint     # ESLint (flat config)
```

## Stack

- React 19.2.5 + Vite 8.0.9
- React Router DOM v7 (`createBrowserRouter`)
- Recharts (`recharts`) para gráficos
- ESLint flat config (`eslint.config.js`, no legacy `.eslintrc`)
- No typecheck script

## Routing (src/router/AppRouter.jsx)

| Group | Paths |
|-------|-------|
| Public | `/`, `/login` |
| Student | `/student/home`, `/student/profile`, `/student/materials`, `/student/study-sessions`, `/student/academic-status`, `/student/academic-assistant` |
| Admin | `/admin/home`, `/admin/careers`, `/admin/study-plan`, `/admin/reports`, `/admin/admins`, `/admin/statistics` |

## Institutional Colors

- Cyan: `#00bcd4`
- Dark Green: `#004d40`
- Teal: `#00695c`
- White: `#ffffff`

## Structure

```
src/
├── components/
│   ├── common/       # Componentes reutilizables
│   ├── header/       # Header
│   ├── layouts/      # Layouts (navbar/sidebar)
│   ├── navbar/       # Navegación
│   ├── landing/     # Componentes de landing
│   ├── materials/   # Materiales
│   └── profile/     # Perfil
├── pages/           # Páginas por rol (public/, student/, admin/)
├── router/           # AppRouter.jsx
└── styles/          # Estilos
```

## Notes

- Use components from `src/components/common/` before creating new ones
- Use CSS modules (`*.module.css`) for page-specific styles, not Tailwind utility classes
- Use separate JSON files for mock data (e.g., `pageNameData.json`)

## Current Gaps

- No authentication or route protection
- Pages are placeholders, need real implementation