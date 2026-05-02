# AGENTS.md

## Project Structure

- **Frontend**: `frontEnd/acompañamiento de alumnos/` (React + Vite)
- **Backend**: `backEnd/` (Express + Sequelize)

## Commands

### Frontend (from frontEnd/acompañamiento de alumnos/)
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint (flat config)
```

### Backend
- No entry point yet (no `index.js`). Use `node index.js` after creating one.
- nodemon is installed for development: add `"dev": "nodemon index.js"` to scripts

## Frontend Stack

- React 19.2.5 + Vite 8.0.9
- React Router DOM v7 (data router - `createBrowserRouter`)
- ESLint flat config (no legacy `.eslintrc`)
- No typecheck script

## Routing (src/router/AppRouter.jsx)

| Route Group | Paths |
|------------|-------|
| Public | `/`, `/login` |
| Student | `/student/home`, `/student/profile`, `/student/materials`, `/student/study-sessions`, `/student/academic-status`, `/student/academic-assistant` |
| Admin | `/admin/home`, `/admin/careers`, `/admin/study-plan`, `/admin/reports`, `/admin/admins`, `/admin/statistics` |

## Institutional Colors

- Cyan: `#00bcd4`
- Dark Green: `#004d40`
- Teal: `#00695c`
- White: `#ffffff`

## Current Gaps

- Backend API and auth not implemented
- No tests configured in either project