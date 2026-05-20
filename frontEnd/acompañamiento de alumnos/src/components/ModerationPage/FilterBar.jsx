import styles from '../../pages/admin/ModerationPage/ModerationPage.module.css';

function FilterBar({ filters, setFilters, materials }) {
  const materias = [
    ...new Set(materials.map((material) => material.materia)),
  ];

  const tipos = [
    ...new Set(materials.map((material) => material.tipo)),
  ];

  return (
    <div className={styles.filtersContainer}>
      <input
        type="text"
        placeholder="Buscar material o usuario..."
        className={styles.searchInput}
        value={filters.search}
        onChange={(event) =>
          setFilters((prev) => ({
            ...prev,
            search: event.target.value,
          }))
        }
      />

      <select
        className={styles.select}
        value={filters.estadoDenuncia}
        onChange={(event) =>
          setFilters((prev) => ({
            ...prev,
            estadoDenuncia: event.target.value,
          }))
        }
      >
        <option value="todos">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="verificada">Verificada</option>
        <option value="rechazada">Rechazada</option>
      </select>

      <select
        className={styles.select}
        value={filters.estadoMaterial}
        onChange={(event) =>
          setFilters((prev) => ({
            ...prev,
            estadoMaterial: event.target.value,
          }))
        }
      >
        <option value="todos">Todos los materiales</option>
        <option value="activo">Activo</option>
        <option value="suspendido">Suspendido</option>
      </select>

      <select
        className={styles.select}
        value={filters.materia}
        onChange={(event) =>
          setFilters((prev) => ({
            ...prev,
            materia: event.target.value,
          }))
        }
      >
        <option value="todos">Todas las materias</option>

        {materias.map((materia) => (
          <option key={materia} value={materia}>
            {materia}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filters.tipo}
        onChange={(event) =>
          setFilters((prev) => ({
            ...prev,
            tipo: event.target.value,
          }))
        }
      >
        <option value="todos">Todos los tipos</option>

        {tipos.map((tipo) => (
          <option key={tipo} value={tipo}>
            {tipo}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterBar;