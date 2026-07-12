import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { getMyProfile } from '../../services/profileService';
import { getCarreras } from '../../services/carreraService';
import { cambiarCarrera } from "../../services/situacionAcademicaService";
import {
  crearSituacion,
  getSituacion,
  actualizarMaterias,
  crearFinal,
  eliminarFinal,
  actualizarFinal,
  crearActividad,
  actualizarActividad,
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

  const normalizar = (texto = '') =>
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  useEffect(() => {
    const cargarCarrerasDelPerfil = async () => {
      try {
        let profileCareers = [];

        try {
          profileCareers = JSON.parse(localStorage.getItem('profileCareers') || '[]');
        } catch {
          profileCareers = [];
        }

        if (profileCareers.length === 0) {
          const perfil = await getMyProfile();
          const carreraPerfil = perfil?.data?.user?.career;

          if (carreraPerfil && carreraPerfil !== 'Carrera no definida') {
            profileCareers = carreraPerfil
              .split(',')
              .map((c) => c.trim())
              .filter(Boolean);
          }
        }

        const resCarreras = await getCarreras();
        const todasLasCarreras = resCarreras?.data ?? [];

        console.log('Carreras guardadas en perfil:', profileCareers);
        console.log('Respuesta getCarreras:', resCarreras);
        console.log('Carreras del backend:', todasLasCarreras);

        const carrerasFiltradas = todasLasCarreras.filter((carrera) =>
          profileCareers.some((careerName) => {
            const perfil = normalizar(careerName);
            const backend = normalizar(carrera.nombre);

            return (
              perfil === backend ||
              perfil.includes(backend) ||
              backend.includes(perfil)
            );
          })
        );

        setCarreras(carrerasFiltradas);
      } catch {
        setCarreras([]);
      } finally {
        setLoading(false);
      }
    };

    cargarCarrerasDelPerfil();
  }, []);

  const carreraSel = carreras.find((c) => c.id === Number(carreraId));
  const planesList = carreraSel?.planes ?? [];

  const handleCrear = async () => {
    if (!planId) return;

    setSaving(true);
    setError(null);

    try {
      try {
        await crearSituacion(Number(planId));
      } catch (err) {
        if (err.status === 409) {
          await cambiarCarrera(Number(planId));
        } else {
          throw err;
        }
      }
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
        {carreras.length === 0 ? (
          <>
            <p className={styles.errorText}>
              No tenés carreras seleccionadas en tu perfil.
            </p>

            <p className={styles.hintText}>
              Para comenzar, andá a tu perfil, tocá “Editar perfil” y agregá al menos una carrera.
            </p>
          </>
        ) : (
          <>
            <div className={styles.wizardField}>
              <label>Carrera</label>

              <select
                value={carreraId}
                onChange={(e) => {
                  setCarreraId(e.target.value);
                  setPlanId('');
                }}
              >
                <option value="">Seleccioná una carrera</option>

                {carreras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
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

            <button
              className={styles.primaryButton}
              disabled={!planId || saving}
              onClick={handleCrear}
            >
              {saving ? 'Creando...' : 'Comenzar'}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default function SituacionAcademica() {
  const [data, setData] = useState(null);
  const [editandoMaterias, setEditandoMaterias] = useState(false);
  const [editandoActividades, setEditandoActividades] = useState(false);
  const [backupSubjects, setBackupSubjects] = useState(null);
  const [backupActivities, setBackupActivities] = useState(null);
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
  const [cambiandoCarrera, setCambiandoCarrera] = useState(false);
  const [expandedMateria, setExpandedMateria] = useState(null);
  const [expandedActividad, setExpandedActividad] = useState(null);
  const [formActividad, setFormActividad] = useState({ descripcion: '', creditos: '', fecha: '', estado: 'pendiente' });

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
        fecha: s.fecha,
      }));
      await actualizarMaterias(materias);
      setEditandoMaterias(false);
      setBackupSubjects(null);
      await cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const actualizarActividadLocal = (actividadId, campo, valor) => {
    if (!data) return;
    setData((prev) => ({
      ...prev,
      credit_activities: (prev.credit_activities || []).map((actividad) =>
        actividad.id === actividadId ? { ...actividad, [campo]: valor } : actividad
      ),
    }));
  };

  const guardarCambiosActividades = async () => {
    if (!data) return;

    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        (data.credit_activities || []).map((actividad) =>
          actualizarActividad(actividad.id, { estado: actividad.estado || 'pendiente' })
        )
      );
      setEditandoActividades(false);
      setBackupActivities(null);
      await cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al guardar actividades');
    } finally {
      setSaving(false);
    }
  };

  const handleAgregarActividad = async () => {
    const { descripcion, creditos, fecha, estado } = formActividad;
    if (!descripcion || !creditos || !fecha) return;
    try {
      await crearActividad({ descripcion, creditos: Number(creditos), fecha, estado });
      setFormActividad({ descripcion: '', creditos: '', fecha: '', estado: 'pendiente' });
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

  const handleAgregarFinal = async (materiaId) => {
    const fechaInput = document.getElementById(`fecha-${materiaId}`);
    const notaInput = document.getElementById(`nota-${materiaId}`);

    if (!fechaInput || !notaInput) return;

    const fecha = fechaInput.value;
    const nota = Number(notaInput.value);

    if (!fecha || Number.isNaN(nota) || nota < 0 || nota > 10) {
      setError('Completá la fecha y la nota (0-10)');
      return;
    }

    const materia = data.subjects.find((s) => s.materia_id === materiaId);

    if (!materia?.estado_materia_id) {
      setError('No se encontró el estado académico de esta materia');
      return;
    }

    try {
      await crearFinal({
        estado_materia_id: materia.estado_materia_id,
        fecha,
        nota,
        aprobado: nota >= 4,
      });

      if (nota >= 4 && materia.status !== 'aprobada') {
        await actualizarMaterias([
          {
            materia_id: materia.materia_id,
            estado: 'aprobada',
            anio: materia.academic_year,
            cuatrimestre: materia.academic_semester,
            nota,
            fecha,
          },
        ]);
      }

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

  if (sinSituacion || cambiandoCarrera) {
    return (
      <WizardPlan
        onCreated={() => {
          setCambiandoCarrera(false);
          cargarDatos();
        }}
      />
    );
  }

  if (loading) return <p className={styles.loading}>Cargando situación académica...</p>;

  if (error) return <p className={styles.loading}>{error}</p>;

  if (!data) return <p className={styles.loading}>No hay datos disponibles</p>;

  const { stats, subjects, credit_activities } = data;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Mi Situación Académica</h1>
          <p>Gestiona tu progreso y visualiza tu trayectoria universitaria</p>
        </div>

        <button
          type="button"
          className={styles.changeCareerButton}
          onClick={() => setCambiandoCarrera(true)}
        >
          Cambiar carrera
        </button>
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
            {editandoMaterias && (
              <button type="button" className={styles.primaryButton} onClick={guardarCambios} disabled={saving}>
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
              </button>
            )}
            <button type="button" className={styles.updateButton} onClick={() => {
              if (editandoMaterias) {
                setData((prev) => ({ ...prev, subjects: backupSubjects }));
                setBackupSubjects(null);
                setEditandoMaterias(false);
              } else {
                setBackupSubjects(JSON.parse(JSON.stringify(data.subjects)));
                setEditandoMaterias(true);
              }
            }}>
              ✎ {editandoMaterias ? 'Cancelar' : 'Editar'}
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
              <table className={`${styles.table} ${styles.materiasTable}${editandoMaterias ? ' ' + styles.editingTable : ''}`}>
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
                      <tr key={materia.materia_id} className={expandedMateria === materia.materia_id ? styles.expanded : ''}>
                        <td className={styles.nameCell} data-label="Materia">
                          {editandoMaterias ? (
                            <input type="text" value={materia.name} readOnly />
                          ) : (
                            materia.name
                          )}
                          <button
                            type="button"
                            className={styles.chevron}
                            aria-label="Mostrar detalles"
                            onClick={() => setExpandedMateria(expandedMateria === materia.materia_id ? null : materia.materia_id)}
                          >
                            <ChevronDown size={18} />
                          </button>
                        </td>
                        <td className={styles.statusCell} data-label="Estado">
                          {editandoMaterias ? (
                            <select value={materia.status} onChange={(e) => actualizarMateriaLocal(materia.materia_id, 'status', e.target.value)}>
                              {ESTADOS.map((est) => <option key={est} value={est}>{est}</option>)}
                            </select>
                          ) : (
                            <span className={`${styles.badge} ${styles[`badge${materia.status.charAt(0).toUpperCase() + materia.status.slice(1)}`] || ''}`}>
                              {materia.status}
                            </span>
                          )}
                        </td>
                        <td className={styles.yearCell} data-label="Año">
                          {materia.year_in_career ? `${materia.year_in_career}°` : '-'}
                        </td>
                        <td className={styles.semesterCell} data-label="Cuatrimestre">
                          {editandoMaterias ? (
                            <input type="number" min="1" max="2" value={materia.academic_semester || ''} onChange={(e) => actualizarMateriaLocal(materia.materia_id, 'academic_semester', e.target.value ? Number(e.target.value) : null)} />
                          ) : (
                            materia.academic_semester ? `${materia.academic_semester}°` : '-'
                          )}
                        </td>
                        <td className={styles.gradeCell} data-label="Nota">
                          {editandoMaterias ? (
                            <input type="number" min="0" max="10" step="0.1" value={materia.grade || ''} onChange={(e) => actualizarMateriaLocal(materia.materia_id, 'grade', e.target.value ? Number(e.target.value) : null)} />
                          ) : (
                            materia.grade ?? '-'
                          )}
                        </td>
                        <td className={styles.creditsCell} data-label="Créditos">{materia.credits || '-'}</td>
                        <td className={styles.finalsCell} data-label="Finales">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {materia.finals?.map((f) => (
                              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                {editandoMaterias ? (
                                  <>
                                    <input type="date" defaultValue={f.fecha?.split('T')[0]} style={{ width: 120, fontSize: 11 }}
                                      onChange={(e) => { f._fecha = e.target.value; }} />
                                    <input type="number" min="0" max="10" step="0.1" defaultValue={f.nota} style={{ width: 50, fontSize: 11 }}
                                      onChange={(e) => { f._nota = Number(e.target.value); }} />
                                    <button type="button" className={styles.smallBtn} onClick={async () => {
                                      await actualizarFinal(f.id, { fecha: f._fecha || f.fecha, nota: f._nota ?? f.nota });
                                      await cargarDatos();
                                    }}>💾</button>
                                    <button type="button" className={styles.smallBtn} onClick={() => handleEliminarFinal(f.id)}>✕</button>
                                  </>
                                ) : (
                                  <div className={styles.finalInfo}>
                                    <span>
                                      <strong>Fecha:</strong> {new Date(f.fecha).toLocaleDateString()}
                                    </span>

                                    <span>
                                      <strong>Nota:</strong> {f.nota}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                            {editandoMaterias && (
                              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                <input type="date" id={`fecha-${materia.materia_id}`} style={{ width: 120, fontSize: 11 }} />
                                <input type="number" min="0" max="10" step="0.1" id={`nota-${materia.materia_id}`} style={{ width: 50, fontSize: 11 }} placeholder="Nota" />
                                <button type="button" className={styles.smallBtn} onClick={() => handleAgregarFinal(materia.materia_id)}>+</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {editandoMaterias && (
              <p className={styles.hintText}>Los cambios se guardan al hacer clic en "Guardar cambios"</p>
            )}
          </>
        )}
      </section>

      <section className={styles.tableCard} style={{ marginTop: 20 }}>
        <div className={styles.tableHeader}>
          <h2>Actividades con créditos</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editandoActividades && (
              <button type="button" className={styles.primaryButton} onClick={guardarCambiosActividades} disabled={saving}>
                {saving ? 'Guardando...' : '💾 Guardar actividades'}
              </button>
            )}
            <button type="button" className={styles.updateButton} onClick={() => {
              if (editandoActividades) {
                setData((prev) => ({ ...prev, credit_activities: backupActivities }));
                setBackupActivities(null);
                setEditandoActividades(false);
              } else {
                setBackupActivities(JSON.parse(JSON.stringify(data.credit_activities || [])));
                setEditandoActividades(true);
              }
            }}>
              ✎ {editandoActividades ? 'Cancelar' : 'Editar actividades'}
            </button>
          </div>
        </div>
        {credit_activities?.length > 0 ? (
          <table className={`${styles.table} ${styles.actividadesTable}`}>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Créditos</th>
                <th>Fecha</th>
                {editandoActividades && <th></th>}
              </tr>
            </thead>
            <tbody>
              {credit_activities.map((act) => (
                <tr key={act.id} className={expandedActividad === act.id ? styles.expanded : ''}>
                  <td className={styles.nameCell} data-label="Descripción">
                    {act.description}
                    <button
                      type="button"
                      className={styles.chevron}
                      aria-label="Mostrar detalles"
                      onClick={() => setExpandedActividad(expandedActividad === act.id ? null : act.id)}
                    >
                      <ChevronDown size={18} />
                    </button>
                  </td>
                  <td className={styles.statusCell} data-label="Estado">
                    {editandoActividades ? (
                      <select value={act.estado || 'pendiente'} onChange={(e) => actualizarActividadLocal(act.id, 'estado', e.target.value)}>
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobada">Aprobada</option>
                      </select>
                    ) : (
                      <span className={`${styles.badge} ${styles[`badge${act.estado === 'aprobada' ? 'Aprobada' : 'Pendiente'}`] || ''}`}>
                        {act.estado || 'pendiente'}
                      </span>
                    )}
                  </td>
                  <td className={styles.creditsCell} data-label="Créditos">{act.credits}</td>
                  <td className={styles.dateCell} data-label="Fecha">{act.date ? new Date(act.date).toLocaleDateString() : '-'}</td>
                  {editandoActividades && (
                    <td className={styles.actionsCell} data-label="Acciones"><button type="button" className={styles.smallBtn} onClick={() => handleEliminarActividad(act.id)}>✕</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ padding: 16, color: '#405a7a', fontSize: 13 }}>No hay actividades con créditos registradas.</p>
        )}
        {editandoActividades && (
          <div className={styles.actividadForm}>
            <input type="text" placeholder="Descripción" value={formActividad.descripcion} onChange={(e) => setFormActividad((p) => ({ ...p, descripcion: e.target.value }))} />
            <select value={formActividad.estado || 'pendiente'} onChange={(e) => setFormActividad((p) => ({ ...p, estado: e.target.value }))}>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
            </select>
            <input type="number" placeholder="Créditos" value={formActividad.creditos} onChange={(e) => setFormActividad((p) => ({ ...p, creditos: e.target.value }))} />
            <input type="date" value={formActividad.fecha} onChange={(e) => setFormActividad((p) => ({ ...p, fecha: e.target.value }))} />
            <button type="button" className={styles.primaryButton} onClick={handleAgregarActividad}>Agregar</button>
          </div>
        )}
      </section>
    </section>
  );
}
