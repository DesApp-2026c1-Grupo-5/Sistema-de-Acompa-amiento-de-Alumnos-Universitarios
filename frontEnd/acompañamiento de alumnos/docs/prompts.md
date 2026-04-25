/init (crea agents.md)

## User

necesito armar las rutas del frontend

## Assistant

_framework_: React
_ask_: ¿Qué rutas necesita el frontend?

## User

en general
- home sin iniciar sesion
- pagina de login

por la parte de estudiantes:
- home del estudiante
- perfil del estudiante
- situacion academica
- asistente academico
- sesiones de estudio
- repositorio de materiales

por la parte de administradores:
- home del administrador
- pagina de gestion de carreras
- pagina para configurar plan de estudio
- pagina de moderacion de denuncias
- pagina de dar de alta administradores
- pagina de estadisticas

## Assistant

Una vez confirmado el plan, te pregunto: ¿tenés algún archivo existente de frontend o preferís que cree la estructura desde cero?

## User

hay una carpeta con el proyecto ya iniciado llamada frontend

## Assistant

## Plan: Configuración de Rutas del Frontend

### Estado Actual
- **Ubicación**: frontEnd\acompañamiento de alumnos
- **Stack**: React 19.2.5 + Vite 8.0.9
- **Faltante**: react-router-dom no instalado, rutas no configuradas

### Estructura de Rutas Propuestas

```
/                           → Landing (sin sesión)
/login                      → Login

/student/home               → Home estudiante
/student/profile            → Perfil
/student/academic-status    → Situación académica
/student/academic-assistant → Asistente académico
/student/study-sessions     → Sesiones de estudio
/student/materials         → Repositorio de materiales

/admin/home                 → Home administrador
/admin/careers              → Gestión de carreras
/admin/study-plan           → Configurar plan de estudio
/admin/reports             → Moderación denuncias
/admin/admins              → Alta administradores
/admin/statistics          → Estadísticas
```

### Pasos de Implementación

1. **Instalar dependencias**
   ```
   npm install react-router-dom
   ```

2. **Crear estructura de carpetas**
   ```
   src/
   ├── pages/
   │   ├── public/          (Landing, Login)
   │   ├── student/         (6 páginas)
   │   ├── admin/           (6 páginas)
   │   └── layouts/         (Layouts con navbar/sidebar)
   ├── components/          (Componentes reutilizables)
   └── router/
        └── AppRouter.jsx   (Definición de rutas)
   ```

3. **Configurar AppRouter.jsx** con BrowserRouter y Routes

4. **Reemplazar App.jsx** con el router configurado

## User

hacélo

## Assistant

Ejecutá `npm run dev` para probar. Cada página tiene un placeholder que podés reemplazar con la lógica real.

---

## User

ahora anota en un md dentro de una nueva carpeta docs lo que hiciste

## Assistant

Listo. Creé `docs/FRONTEND_ROUTES.md` con la documentación completa.

---

## User

actualiza el agents.md

## Assistant

Listo. Actualicé `AGENTS.md` con la info real del proyecto.