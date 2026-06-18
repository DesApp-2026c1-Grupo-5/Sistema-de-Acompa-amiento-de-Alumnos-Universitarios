import { useEffect, useRef, useState, useCallback } from 'react';
import { getCarreras } from '../../services/carreraService';
import {
  crearSituacion,
  getSituacion,
  actualizarMaterias,
  crearFinal,
  eliminarFinal,
  crearActividad,
  eliminarActividad,
  importarExcel,
  confirmarImportacion,
} from '../../services/situacionAcademicaService';
import styles from './SituacionAcademica.module.css';

const ESTADOS = ['pendiente', 'cursando', 'regular', 'aprobada'];

function WizardPlan({ onCreated }) {
  const [carreras, setCarreras] = useState([]);
  const [carreraId, setCarreraId] = useState('');
  const [planId, setPlanId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCarreras()
      .then((res) => { setCarreras(res?.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const carreraSel = carreras.find((c) => c.id === Number(carreraId));
  const planesList = carreraSel?.planes ?? [];

  const handleCrear = async () => {
    if (!planId) return;
    setSaving(true);
    setError(null);
    try {
      await crearSituacion(Number(planId));
      onCreated();
    } catch (err) {
      setError(err.message || 'Error al crear la situación académica');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className={styles.loading}>Cargando carreras...</p>;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Mi Situación Académica</h1>
        <p>Primero, seleccioná tu carrera y plan de estudios</p>
      </header>
      <div className={styles.wizardCard}>
        <div className={styles.wizardField}>
          <label>Carrera</label>
          <select value={carreraId} onChange={(e) => { setCarreraId(e.target.value); setPlanId(''); }}>
            <option value="">Seleccioná una carrera</option>
            {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        {planesList.length > 0 && (
          <div className={styles.wizardField}>
            <label>Plan de estudios</label>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">Seleccioná un plan</option>
              {planesList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.estado})
                </option>
              ))}
            </select>
          </div>
        )}
        {error && <p className={styles.errorText}>{error}</p>}
        <button className={styles.primaryButton} disabled={!planId || saving} onClick={handleCrear}>
          {saving ? 'Creando...' : 'Comenzar'}
        </button>
      </div>
    </section>
  );
}

export default function SituacionAcademica() {
  const [data, setData] = useState(null);
  const [editando, setEditando] = useState(false);
  const [mostrarCargaExcel, setMostrarCargaExcel] = useState(false);
  const [archivoExcel, setArchivoExcel] = useState(null);
  const [previewExcel, setPreviewExcel] = useState(null);
  const [creditActivitiesPreview, setCreditActivitiesPreview] = useState([]);
  const [excelErrors, setExcelErrors] = useState([]);
  const inputExcelRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sinSituacion, setSinSituacion] = useState(false);
  const [formActividad, setFormActividad] = useState({ descripcion: '', creditos: '', fecha: '' });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSituacion();
      if (!res?.data) {
        setSinSituacion(true);
        setData(null);
      } else {
        setSinSituacion(false);
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar situación académica');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSituacion();
        if (cancelled) return;
        if (!res?.data) {
          setSinSituacion(true);
          setData(null);
        } else {
          setSinSituacion(false);
          setData(res.data);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Error al cargar situación académica');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const actualizarMateriaLocal = (materiaId, campo, valor) => {
    if (!data) return;
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) =>
        s.materia_id === materiaId ? { ...s, [campo]: valor } : s
      ),
    }));
  };

  const guardarCambios = async () => {
    if (!data) return;
    setSaving(true);
    setError(null);
    try {
      const materias = data.subjects.map((s) => ({
        materia_id: s.materia_id,
        estado: s.status,
        anio: s.academic_year,
        cuatrimestre: s.academic_semester,
        nota: s.grade,
      }));
      await actualizarMaterias(materias);
      setEditando(false);
      await cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleAgregarActividad = async () => {
    const { descripcion, creditos, fecha } = formActividad;
    if (!descripcion || !creditos || !fecha) return;
    try {
      await crearActividad({ descripcion, creditos: Number(creditos), fecha });
      setFormActividad({ descripcion: '', creditos: '', fecha: '' });
      await cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al agregar actividad');
    }
  };

  const handleEliminarActividad = async (id) => {
    try {
      await eliminarActividad(id);
      await cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al eliminar actividad');
    }
  };

  const handleAgregarFinal = async (estadoMateriaId) => {
    const nota = prompt('Nota del final (0-10):');
    if (nota === null) return;
    const notaNum = Number(nota);
    if (Number.isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      setError('La nota debe ser un número entre 0 y 10');
      return;
    }
    const aprobado = notaNum >= 4;
    try {
      await crearFinal({
        estado_materia_id: estadoMateriaId,
        fecha: new Date().toISOString().split('T')[0],
        nota: notaNum,
        aprobado,
      });
      await cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al agregar final');
    }
  };

  const handleEliminarFinal = async (id) => {
    if (!confirm('¿Eliminar este final?')) return;
    try {
      await eliminarFinal(id);
      await cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al eliminar final');
    }
  };

  const handleSeleccionarExcel = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    setArchivoExcel(archivo);
  };

  const handleImportarExcel = async () => {
    if (!archivoExcel) return;
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('archivo', archivoExcel);
      const res = await importarExcel(fd);
      const { preview, errors, creditActivities } = res?.data ?? {};
      if (errors?.length > 0) {
        setExcelErrors(errors);
      }
      setPreviewExcel(preview ?? []);
      setCreditActivitiesPreview(creditActivities ?? []);
      if (!errors || errors.length === 0) {
        await confirmarImportacion(preview ?? [], creditActivities ?? []);
        setArchivoExcel(null);
        setMostrarCargaExcel(false);
        await cargarDatos();
      }
    } catch (err) {
      setError(err.message || 'Error al importar Excel');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmarExcel = async () => {
    if (!previewExcel) return;
    setSaving(true);
    setError(null);
    try {
      await confirmarImportacion(previewExcel, creditActivitiesPreview);
      setPreviewExcel(null);
      setCreditActivitiesPreview([]);
      setExcelErrors([]);
      setArchivoExcel(null);
      setMostrarCargaExcel(false);
      await cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al confirmar importación');
    } finally {
      setSaving(false);
    }
  };

  if (sinSituacion) return <WizardPlan onCreated={cargarDatos} />;

  if (loading) return <p className={styles.loading}>Cargando situación académica...</p>;

  if (error) return <p className={styles.loading}>{error}</p>;

  if (!data) return <p className={styles.loading}>No hay datos disponibles</p>;

  const { stats, subjects, credit_activities } = data;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Mi Situación Académica</h1>
        <p>Gestiona tu progreso y visualiza tu trayectoria universitaria</p>
      </header>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconPrimary}`}>↗</div>
          <strong>{stats.progress_percentage}%</strong>
          <span>Avance de carrera</span>
        </article>
        <article className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconSuccess}`}>✓</div>
          <strong>{stats.approved}</strong>
          <span>Materias aprobadas</span>
        </article>
        <article className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconWarning}`}>○</div>
          <strong>{stats.regularized}</strong>
          <span>Materias regularizadas</span>
        </article>
        <article className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconDanger}`}>⚠</div>
          <strong>{stats.pending}</strong>
          <span>Materias pendientes</span>
        </article>
        <article className={`${styles.statCard} ${styles.creditsCard}`}>
          <div className={`${styles.iconBox} ${styles.iconPrimary}`}>▯</div>
          <strong>
            {stats.credits_obtained}
            <small>/{data.situation.credits_required}</small>
          </strong>
          <span>Créditos obtenidos</span>
        </article>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2>Materias</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editando && (
              <button type="button" className={styles.primaryButton} onClick={guardarCambios} disabled={saving}>
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
              </button>
            )}
            <button type="button" className={styles.updateButton} onClick={() => setEditando(!editando)}>
              ✎ {editando ? 'Cancelar' : 'Editar'}
            </button>
          </div>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={!mostrarCargaExcel ? styles.primaryButton : styles.secondaryButton} onClick={() => setMostrarCargaExcel(false)}>
            Carga manual
          </button>
          <button type="button" className={mostrarCargaExcel ? styles.primaryButton : styles.secondaryButton} onClick={() => setMostrarCargaExcel(true)}>
            ▣ Carga desde Excel
          </button>
        </div>

        {mostrarCargaExcel && (
          <div className={styles.excelUploadBox}>
            <input ref={inputExcelRef} type="file" accept=".xls,.xlsx" className={styles.excelInput} onChange={handleSeleccionarExcel} />
            <div className={styles.excelIcon}>⇧</div>
            <p className={styles.excelTitle}>Arrastra tu archivo Excel aquí</p>
            <p className={styles.excelSubtitle}>o haz clic para seleccionar</p>
            <button type="button" className={styles.excelButton} onClick={() => inputExcelRef.current?.click()}>
              Seleccionar archivo
            </button>
            {archivoExcel && <p className={styles.excelFileName}>Archivo seleccionado: {archivoExcel.name}</p>}
            {archivoExcel && !previewExcel && (
              <button type="button" className={styles.primaryButton} style={{ marginTop: 12 }} onClick={handleImportarExcel} disabled={saving}>
                {saving ? 'Procesando...' : 'Previsualizar'}
              </button>
            )}

            {excelErrors.length > 0 && (
              <div className={styles.excelErrors}>
                <h4>Errores en el archivo ({excelErrors.length})</h4>
                {excelErrors.map((e) => (
                  <p key={e.row} className={styles.errorText}>Fila {e.row}: {e.materia} — {e.errors.join(', ')}</p>
                ))}
              </div>
            )}

            {previewExcel && previewExcel.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p>
                  {previewExcel.length} materias válidas para importar
                  {creditActivitiesPreview.length > 0 && (
                    <> + {creditActivitiesPreview.length} actividades con crédito</>
                  )}
                </p>
                <button type="button" className={styles.primaryButton} onClick={handleConfirmarExcel} disabled={saving}>
                  {saving ? 'Importando...' : '✅ Confirmar importación'}
                </button>
              </div>
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
                    <th>Créditos</th>
                    <th>Finales</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((materia) => {
                    return (
                      <tr key={materia.materia_id}>
                        <td>
                          {editando ? (
                            <input type="text" value={materia.name} readOnly />
                          ) : (
                            materia.name
                          )}
                        </td>
                        <td>
                          {editando ? (
                            <select value={materia.status} onChange={(e) => actualizarMateriaLocal(materia.materia_id, 'status', e.target.value)}>
                              {ESTADOS.map((est) => <option key={est} value={est}>{est}</option>)}
                            </select>
                          ) : (
                            <span className={`${styles.badge} ${styles[`badge${materia.status.charAt(0).toUpperCase() + materia.status.slice(1)}`] || ''}`}>
                              {materia.status}
                            </span>
                          )}
                        </td>
                        <td>
                          {editando ? (
                            <input type="number" value={materia.academic_year || ''} onChange={(e) => actualizarMateriaLocal(materia.materia_id, 'academic_year', e.target.value ? Number(e.target.value) : null)} />
                          ) : (
                            materia.academic_year ? `${materia.academic_year}°` : '-'
                          )}
                        </td>
                        <td>
                          {editando ? (
                            <input type="number" min="1" max="2" value={materia.academic_semester || ''} onChange={(e) => actualizarMateriaLocal(materia.materia_id, 'academic_semester', e.target.value ? Number(e.target.value) : null)} />
                          ) : (
                            materia.academic_semester ? `${materia.academic_semester}°` : '-'
                          )}
                        </td>
                        <td>
                          {editando ? (
                            <input type="number" min="0" max="10" step="0.1" value={materia.grade || ''} onChange={(e) => actualizarMateriaLocal(materia.materia_id, 'grade', e.target.value ? Number(e.target.value) : null)} />
                          ) : (
                            materia.grade ?? '-'
                          )}
                        </td>
                        <td>{materia.credits || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {materia.finals?.map((f) => (
                              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                <span>{new Date(f.fecha).toLocaleDateString()}: {f.nota} {f.aprobado ? '✅' : '❌'}</span>
                                {editando && (
                                  <button type="button" className={styles.smallBtn} onClick={() => handleEliminarFinal(f.id)}>✕</button>
                                )}
                              </div>
                            ))}
                            {editando && (
                              <button type="button" className={styles.smallBtn} onClick={() => handleAgregarFinal(materia.finals?.[0]?.estado_materia_id || materia.materia_id)}>
                                + Final
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {editando && (
              <p className={styles.hintText}>Los cambios se guardan al hacer clic en "Guardar cambios"</p>
            )}
          </>
        )}
      </section>

      <section className={styles.tableCard} style={{ marginTop: 20 }}>
        <div className={styles.tableHeader}>
          <h2>Actividades con créditos</h2>
        </div>
        {credit_activities?.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Créditos</th>
                <th>Fecha</th>
                {editando && <th></th>}
              </tr>
            </thead>
            <tbody>
              {credit_activities.map((act) => (
                <tr key={act.id}>
                  <td>{act.description}</td>
                  <td>{act.credits}</td>
                  <td>{act.date ? new Date(act.date).toLocaleDateString() : '-'}</td>
                  {editando && (
                    <td><button type="button" className={styles.smallBtn} onClick={() => handleEliminarActividad(act.id)}>✕</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ padding: 16, color: '#405a7a', fontSize: 13 }}>No hay actividades con créditos registradas.</p>
        )}
        {editando && (
          <div className={styles.actividadForm}>
            <input type="text" placeholder="Descripción" value={formActividad.descripcion} onChange={(e) => setFormActividad((p) => ({ ...p, descripcion: e.target.value }))} />
            <input type="number" placeholder="Créditos" value={formActividad.creditos} onChange={(e) => setFormActividad((p) => ({ ...p, creditos: e.target.value }))} />
            <input type="date" value={formActividad.fecha} onChange={(e) => setFormActividad((p) => ({ ...p, fecha: e.target.value }))} />
            <button type="button" className={styles.primaryButton} onClick={handleAgregarActividad}>Agregar</button>
          </div>
        )}
      </section>
    </section>
  );
}
