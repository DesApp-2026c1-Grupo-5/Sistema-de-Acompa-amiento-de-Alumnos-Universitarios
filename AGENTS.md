# AGENTS.md

## Repo Layout
- This repo has two independent Node projects: `frontEnd/acompañamiento de alumnos/` and `backEnd/`.
- The frontend path includes a space and `ñ`; always quote it in shell commands.
- Root `package-lock.json` and `frontEnd/package-lock.json` are placeholders; real installs/lockfiles are inside each app directory.

## Commands You Should Actually Use
- Frontend (run from `frontEnd/acompañamiento de alumnos/`): `npm run dev`, `npm run lint`, `npm run build`, `npm run preview`.
- Backend (run from `backEnd/`): `npm run dev` starts `nodemon src/server.js`.
- Backend tests are not implemented: `npm test` is a placeholder that exits with error.

## Backend Data Safety Gotcha
- `backEnd/src/server.js` runs `sequelize.sync({ force: true })` on startup (currently duplicated), which drops/recreates tables in the target DB.

## DB and Sequelize Wiring
- Backend env is loaded from `backEnd/.env` (`PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_TEST_NAME`, `DB_PROD_NAME`, `DB_HOST`, `DB_PORT`, `DB_DIALECT`).
- `backEnd/.sequelizerc` remaps Sequelize CLI paths to `src/db/config/config.js`, `src/db/models`, `src/db/migrations`, and `src/db/seeders`.

## Real Entrypoints
- Frontend bootstraps at `frontEnd/acompañamiento de alumnos/src/main.jsx` and uses router config in `frontEnd/acompañamiento de alumnos/src/router/AppRouter.jsx`.
- Backend bootstraps at `backEnd/src/server.js`; Express app setup is in `backEnd/src/app.js`.

## Verification Reality
- No CI workflows in `.github/workflows/` and no pre-commit config found.
- Practical validation is frontend `npm run lint` then `npm run build`; backend has no automated test gate.
