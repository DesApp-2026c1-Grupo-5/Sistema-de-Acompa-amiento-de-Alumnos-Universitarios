# AGENTS.md

## Project Structure

- **Frontend**: `frontEnd/acompañamiento de alumnos/` (React + Vite)
- **Backend**: `backEnd/` (Express + Sequelize + MySQL)

## Commands

### Frontend
```bash
cd frontEnd/acompañamiento de alumnos
npm run dev      # Start dev server (port 5173)
npm run build    # Production build
npm run preview # Preview production build
npm run lint     # ESLint (flat config)
```
<Button
  variant="primary"      // primary, secondary, outline, ghost, danger, dangerSolid, primarySoft, gradient, filter, filterActive, iconSquare, iconSquareDanger
  size="md"             // sm, md, lg
  type="button"         // button, submit, reset
  disabled={false}
  fullWidth={false}
  iconLeft={null}       // elemento React (ej: <Icon size={16} />)
  iconRight={null}
  onClick={handler}
>
  Texto del botón
</Button>
```

### ModalConfirmation (`src/components/common/ModalConfirmation.jsx`)
Componente de modal de confirmación reutilizable.

```jsx
import ModalConfirmation from '../../components/common/ModalConfirmation';

<ModalConfirmation
  open={showModal}           // boolean - controlar visibilidad
  title="Confirmar acción"   // titulo del modal
  message="¿Está seguro?"   // mensaje de confirmación
  confirmText="Confirmar"    // texto del botón confirmar
  cancelText="Cancelar"      // texto del botón cancelar
  onConfirm={handler}        // callback al confirmar
  onCancel={handler}         // callback al cancelar
  variant="danger"          // 'danger' (rojo) o 'primary' (azul)
/>
```
### Backend
- No entry point yet (`index.js` missing). Create it and add `"dev": "nodemon index.js"` to scripts.
- Sequelize CLI available: `npx sequelize-cli` for migrations/seeders.

## Frontend Stack

- React 19.2.5 + Vite 8.0.9
- React Router DOM v7 (`createBrowserRouter` - data router)
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

## Backend Config

- `.sequelizerc` maps to `src/db/{config,models,seeders,migrations}`
- Database: MySQL (via `mysql2`)
- Env vars: `.env` file exists but no app entry point configured yet

## Current Gaps

- Backend: no `index.js`, no API routes, no auth
- No tests in either project