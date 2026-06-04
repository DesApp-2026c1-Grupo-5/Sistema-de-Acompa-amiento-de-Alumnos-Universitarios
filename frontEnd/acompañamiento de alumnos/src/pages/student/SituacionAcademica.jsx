import { useEffect, useRef, useState } from 'react';

import styles from './SituacionAcademica.module.css';

export default function SituacionAcademica() {
  const [data, setData] = useState(null);
  const [editando, setEditando] = useState(false);
  const [mostrarCargaExcel, setMostrarCargaExcel] = useState(false);
  const [archivoExcel, setArchivoExcel] = useState(null);
  const inputExcelRef = useRef(null);

  const [formMateria, setFormMateria] = useState({
    nombre: '',
    estado: 'Pendiente',
    anio: '1',
    cuatrimestre: '1',
    nota: '0',
    tieneCreditos: 'No',
  });

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const response = await fetch('/data/situacionAcademica.json');

        if (!response.ok) {
          throw new Error('No se pudo cargar el JSON');
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
      }
    };

    obtenerDatos();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormMateria((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSeleccionarExcel = (event) => {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    setArchivoExcel(archivo);
  };

  if (!data) {
    return <p className={styles.loading}>Cargando situación académica...</p>;
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Mi Situación Académica</h1>
        <p>Gestiona tu progreso y visualiza tu trayectoria universitaria</p>
      </header>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconPrimary}`}>↗</div>
          <strong>{data.resumen.avance}%</strong>
          <span>Avance de carrera</span>
        </article>

        <article className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconSuccess}`}>✓</div>
          <strong>{data.resumen.materiasAprobadas}</strong>
          <span>Materias aprobadas</span>
        </article>

        <article className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconWarning}`}>○</div>
          <strong>{data.resumen.materiasRegularizadas}</strong>
          <span>Materias regularizadas</span>
        </article>

        <article className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconDanger}`}>⚠</div>
          <strong>{data.resumen.materiasPendientes}</strong>
          <span>Materias pendientes</span>
        </article>

        <article className={`${styles.statCard} ${styles.creditsCard}`}>
          <div className={`${styles.iconBox} ${styles.iconPrimary}`}>▯</div>
          <strong>
            {data.resumen.creditosObtenidos}
            <small>/{data.resumen.creditosTotales}</small>
          </strong>
          <span>Créditos obtenidos</span>
        </article>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2>Carga inicial de datos</h2>

          <button
            type="button"
            className={styles.updateButton}
            onClick={() => setEditando(!editando)}
          >
            ✎ {editando ? 'Terminar edición' : 'Actualizar'}
          </button>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={mostrarCargaExcel ? styles.secondaryButton : styles.primaryButton}
            onClick={() => setMostrarCargaExcel(false)}
          >
            Carga manual
          </button>

          <button
            type="button"
            className={mostrarCargaExcel ? styles.primaryButton : styles.secondaryButton}
            onClick={() => setMostrarCargaExcel(true)}
          >
            ▣ Carga desde Excel
          </button>
        </div>

        {mostrarCargaExcel && (
          <div className={styles.excelUploadBox}>
            <input
              ref={inputExcelRef}
              type="file"
              accept=".xls,.xlsx"
              className={styles.excelInput}
              onChange={handleSeleccionarExcel}
            />

            <div className={styles.excelIcon}>⇧</div>

            <p className={styles.excelTitle}>Arrastra tu archivo Excel aquí</p>
            <p className={styles.excelSubtitle}>o haz clic para seleccionar</p>

            <button
              type="button"
              className={styles.excelButton}
              onClick={() => inputExcelRef.current?.click()}
            >
              Seleccionar archivo
            </button>

            {archivoExcel && (
              <p className={styles.excelFileName}>
                Archivo seleccionado: {archivoExcel.name}
              </p>
            )}
          </div>
        )}

        {!mostrarCargaExcel && (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Estado</th>
                    <th>Año</th>
                    <th>Cuatrimestre</th>
                    <th>Nota</th>
                    <th>Tiene créditos</th>
                    <th>Cantidad de créditos</th>
                  </tr>
                </thead>

                <tbody>
                  {data.materias.map((materia) => (
                    <tr key={materia.id}>
                      <td>
                        {editando ? (
                          <input type="text" value={materia.nombre} readOnly />
                        ) : (
                          materia.nombre
                        )}
                      </td>

                      <td>
                        {editando ? (
                          <select value={materia.estado} readOnly>
                            <option>Aprobada</option>
                            <option>Regularizada</option>
                            <option>Pendiente</option>
                          </select>
                        ) : (
                          <span
                            className={`${styles.badge} ${styles[`badge${materia.estado}`]
                              }`}
                          >
                            {materia.estado}
                          </span>
                        )}
                      </td>

                      <td>
                        {editando ? (
                          <input type="number" value={materia.anio} readOnly />
                        ) : (
                          `${materia.anio}°`
                        )}
                      </td>

                      <td>
                        {editando ? (
                          <input
                            type="number"
                            value={materia.cuatrimestre}
                            readOnly
                          />
                        ) : (
                          `${materia.cuatrimestre}°`
                        )}
                      </td>

                      <td>
                        {editando ? (
                          <input
                            type="number"
                            value={materia.nota || ''}
                            readOnly
                          />
                        ) : (
                          materia.nota || '-'
                        )}
                      </td>

                      <td>
                        {editando ? (
                          <select
                            value={materia.tieneCreditos ? 'Sí' : 'No'}
                            readOnly
                          >
                            <option>Sí</option>
                            <option>No</option>
                          </select>
                        ) : materia.tieneCreditos ? (
                          'Sí'
                        ) : (
                          'No'
                        )}
                      </td>

                      <td>
                        {editando ? (
                          <input
                            type="text"
                            value={materia.creditos || '-'}
                            readOnly
                          />
                        ) : (
                          materia.creditos || '-'
                        )}
                      </td>
                    </tr>
                  ))}

                  <tr className={styles.formRow}>
                    <td>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre de la materia"
                        value={formMateria.nombre}
                        onChange={handleChange}
                      />
                    </td>

                    <td>
                      <select
                        name="estado"
                        value={formMateria.estado}
                        onChange={handleChange}
                      >
                        <option>Pendiente</option>
                        <option>Aprobada</option>
                        <option>Regularizada</option>
                      </select>
                    </td>

                    <td>
                      <input
                        type="number"
                        name="anio"
                        value={formMateria.anio}
                        onChange={handleChange}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        name="cuatrimestre"
                        value={formMateria.cuatrimestre}
                        onChange={handleChange}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        name="nota"
                        value={formMateria.nota}
                        onChange={handleChange}
                      />
                    </td>

                    <td>
                      <select
                        name="tieneCreditos"
                        value={formMateria.tieneCreditos}
                        onChange={handleChange}
                      >
                        <option>No</option>
                        <option>Sí</option>
                      </select>
                    </td>

                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button className={styles.addButton}>＋ Agregar materia</button>
          </>
        )}
      </section>
    </section>
  );
}