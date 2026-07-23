import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { getCarreras } from '../../services/carreraService';
import ModalConfirmation from '../../components/common/ModalConfirmation';
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
  cambiarCarrera,
  descargarPlantillaExcel,
} from '../../services/situacionAcademicaService';
import styles from './SituacionAcademica.module.css';

const ESTADOS = ['pendiente', 'cursando', 'regular', 'aprobada'];
const CAMPOS_MATERIA_EDITABLES = ['status', 'academic_year', 'grade', 'fecha'];
const ESTADOS_REQUERIDOS = {
  cursar: ['regular', 'aprobada'],
  aprobar: ['aprobada'],
};
const ESTADOS_PLAN_SELECCIONABLES = ['vigente', 'transicion'];
const ETIQUETAS_ESTADO_PLAN = {
  vigente: 'Vigente',
  transicion: 'En transición',
};

const normalizarEstado = (estado) => {
  const value = String(estado || 'pendiente').trim().toLowerCase();
  return ESTADOS.includes(value) ? value : 'pendiente';
};

const getEstadosRequeridos = (tipo) =>
  ESTADOS_REQUERIDOS[String(tipo || '').trim().toLowerCase()] || [];

const getEstadoCorrelativa = (correlativa, estadosPorMateria) =>
  normalizarEstado(
    estadosPorMateria.get(Number(correlativa.materia_requisito_id)) ?? correlativa.current_status
  );

const cumpleCorrelativas = (materia, estadosPorMateria) =>
  (materia.correlatives || []).every((correlativa) =>
    getEstadosRequeridos(correlativa.tipo).includes(
      getEstadoCorrelativa(correlativa, estadosPorMateria)
    )
  );

const obtenerIncumplimientosBorrador = (subjects = []) => {
  const estadosPorMateria = new Map(
    subjects.map((materia) => [Number(materia.materia_id), normalizarEstado(materia.status)])
  );

  return subjects.flatMap((materia) => {
    if (normalizarEstado(materia.status) === 'pendiente') return [];

    return (materia.correlatives || []).flatMap((correlativa) => {
      const requiredStatuses = getEstadosRequeridos(correlativa.tipo);
      const currentStatus = getEstadoCorrelativa(correlativa, estadosPorMateria);
      if (requiredStatuses.includes(currentStatus)) return [];

      return [{
        materia_id: materia.materia_id,
        materia: materia.name,
        estado_proyectado: materia.status,
        materia_requisito_id: correlativa.materia_requisito_id,
        requisito: correlativa.name,
        requisito_codigo: correlativa.code,
        tipo: correlativa.tipo,
        estado_requisito_proyectado: currentStatus,
        estados_aceptados: requiredStatuses,
      }];
    });
  });
};

const crearErrorAccion = (err, fallback) => ({
  message: err?.message || fallback,
  violations: Array.isArray(err?.details?.violations) ? err.details.violations : [],
});

const getMotivoIncumplimiento = (violation) => {
  const materia = violation.materia || `Materia ${violation.materia_id}`;
  const requisito = violation.requisito
    || violation.requisito_codigo
    || `Materia ${violation.materia_requisito_id}`;
  const codigo = violation.requisito_codigo && violation.requisito
    ? `${violation.requisito_codigo} · `
    : '';
  const requeridos = (violation.estados_aceptados || []).join(' o ') || 'habilitado';
  const actual = normalizarEstado(violation.estado_requisito_proyectado);
  const tipo = violation.tipo === 'aprobar' ? 'aprobar' : 'cursar';

  return `${materia}: para ${tipo} requiere ${codigo}${requisito} en estado ${requeridos}; actualmente está ${actual}.`;
};

function ActionError({ error }) {
  if (!error) return null;

  return (
    <div className={styles.actionError} role="alert">
      <p>{error.message}</p>
      {error.violations?.length > 0 && (
        <ul>
          {error.violations.map((violation, index) => (
            <li key={`${violation.materia_id}-${violation.materia_requisito_id}-${index}`}>
              {getMotivoIncumplimiento(violation)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WizardPlan({ mode = 'create', currentPlanId, onCreated, onCancel }) {
  const [carreras, setCarreras] = useState([]);
  const [carreraId, setCarreraId] = useState('');
  const [planId, setPlanId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const isChanging = mode === 'change';

  const cargarCarreras = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const response = await getCarreras();
      setCarreras(response?.data ?? []);
    } catch (err) {
      setCarreras([]);
      setLoadError(err.message || 'No pudimos cargar las carreras disponibles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    getCarreras()
      .then((response) => {
        if (!cancelled) setCarreras(response?.data ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setCarreras([]);
        setLoadError(err.message || 'No pudimos cargar las carreras disponibles.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const carreraSel = carreras.find((c) => c.id === Number(carreraId));
  const planesList = (carreraSel?.planes ?? []).filter((plan) =>
    ESTADOS_PLAN_SELECCIONABLES.includes((plan.estado ?? '').toLowerCase())
  );
  const planSel = planesList.find((plan) => plan.id === Number(planId));

  const getPlanLabel = (plan) =>
    plan.nombre || (plan.anio ? `Plan ${plan.anio}` : `Plan ${plan.id}`);

  const guardarSeleccion = async () => {
    if (!planId) return;

    setSaving(true);
    setError(null);

    try {
      if (isChanging) {
        await cambiarCarrera(Number(planId));
      } else {
        await crearSituacion(Number(planId));
      }
      await onCreated();
    } catch (err) {
      setError(
        err.message ||
          (isChanging
            ? 'No pudimos cambiar la carrera.'
            : 'No pudimos crear la situación académica.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    if (!planId || saving || Number(planId) === Number(currentPlanId)) return;

    if (isChanging) {
      setConfirmationOpen(true);
      return;
    }

    guardarSeleccion();
  };

  const handleConfirmChange = () => {
    setConfirmationOpen(false);
    guardarSeleccion();
  };

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Mi Situación Académica</h1>
          <p>
            {isChanging
              ? 'Seleccioná la nueva carrera y su plan de estudios'
              : 'Primero, seleccioná tu carrera y plan de estudios'}
          </p>
        </div>
      </header>

      <div className={styles.wizardCard}>
        {loading ? (
          <p className={styles.wizardStatus}>Cargando carreras disponibles...</p>
        ) : loadError ? (
          <div className={styles.wizardStatus} role="alert">
            <p className={styles.errorText}>{loadError}</p>
            <button type="button" className={styles.secondaryButton} onClick={cargarCarreras}>
              Reintentar
            </button>
          </div>
        ) : carreras.length === 0 ? (
          <div className={styles.wizardStatus}>
            <p className={styles.emptyTitle}>No hay carreras disponibles</p>
            <p className={styles.hintText}>Contactá a administración para poder iniciar tu trayectoria académica.</p>
          </div>
        ) : (
          <>
            <div className={styles.wizardField}>
              <label htmlFor="academic-career">Carrera</label>

              <select
                id="academic-career"
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

            <div className={styles.wizardField}>
              <label htmlFor="academic-plan">Plan de estudios</label>

              <select
                id="academic-plan"
                value={planId}
                disabled={!carreraId || planesList.length === 0}
                onChange={(e) => setPlanId(e.target.value)}
              >
                <option value="">Seleccioná un plan</option>

                {planesList.map((plan) => {
                  const isCurrent = Number(plan.id) === Number(currentPlanId);
                  return (
                    <option key={plan.id} value={plan.id} disabled={isChanging && isCurrent}>
                      {getPlanLabel(plan)} · {ETIQUETAS_ESTADO_PLAN[plan.estado] ?? plan.estado}
                      {isChanging && isCurrent ? ' (actual)' : ''}
                    </option>
                  );
                })}
              </select>

              {carreraId && planesList.length === 0 && (
                <p className={styles.hintText}>Esta carrera no tiene planes habilitados para nuevas inscripciones.</p>
              )}
            </div>

            {error && <p className={styles.errorText} role="alert">{error}</p>}

            <div className={styles.wizardActions}>
              {isChanging && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={saving}
                  onClick={onCancel}
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                className={styles.primaryButton}
                disabled={!planId || saving || Number(planId) === Number(currentPlanId)}
                onClick={handleSubmit}
              >
                {saving ? 'Guardando...' : isChanging ? 'Cambiar carrera' : 'Comenzar'}
              </button>
            </div>
          </>
        )}
      </div>

      <ModalConfirmation
        open={confirmationOpen}
        title="Cambiar carrera"
        message={`Cambiar a ${carreraSel?.nombre ?? 'la carrera seleccionada'} (${planSel ? getPlanLabel(planSel) : 'plan seleccionado'}) eliminará las materias, finales y créditos registrados. ¿Querés continuar?`}
        confirmText="Cambiar carrera"
        onConfirm={handleConfirmChange}
        onCancel={() => setConfirmationOpen(false)}
      />
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
  const [excelLoading, setExcelLoading] = useState(false);
  const inputExcelRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sinSituacion, setSinSituacion] = useState(false);
  const [cambiandoCarrera, setCambiandoCarrera] = useState(false);
  const [expandedMateria, setExpandedMateria] = useState(null);
  const [expandedActividad, setExpandedActividad] = useState(null);
  const [finalErrors, setFinalErrors] = useState({});
  const [formActividad, setFormActividad] = useState({ descripcion: '', creditos: '', fecha: '', estado: 'pendiente' });
  const [activityErrors, setActivityErrors] = useState({});

  const cargarDatos = useCallback(async (syncSubjectsBackup = false) => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getSituacion();
      if (!res?.data) {
        setSinSituacion(true);
        setData(null);
      } else {
        setSinSituacion(false);
        setData(res.data);
        if (syncSubjectsBackup) {
          setBackupSubjects(JSON.parse(JSON.stringify(res.data.subjects || [])));
        }
      }
    } catch (err) {
      setLoadError(err.message || 'Error al cargar situación académica');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
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
        setLoadError(err.message || 'Error al cargar situación académica');
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
    if (obtenerIncumplimientosBorrador(data.subjects).length > 0) return;

    const snapshotPorMateria = new Map(
      (backupSubjects || []).map((materia) => [Number(materia.materia_id), materia])
    );
    const materiasModificadas = data.subjects.filter((materia) => {
      const snapshot = snapshotPorMateria.get(Number(materia.materia_id));
      return !snapshot || CAMPOS_MATERIA_EDITABLES.some(
        (campo) => (materia[campo] ?? null) !== (snapshot[campo] ?? null)
      );
    });

    if (materiasModificadas.length === 0) {
      setEditandoMaterias(false);
      setBackupSubjects(null);
      setActionError(null);
      return;
    }

    setSaving(true);
    setActionError(null);
    try {
      const materias = materiasModificadas.map((s) => ({
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
      setActionError(crearErrorAccion(err, 'Error al guardar cambios'));
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
    setActionError(null);
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
      setActionError(crearErrorAccion(err, 'Error al guardar actividades'));
    } finally {
      setSaving(false);
    }
  };

  const handleAgregarActividad = async () => {
    const { descripcion, creditos, fecha, estado } = formActividad;
    const missing = { descripcion: !descripcion, creditos: !creditos, fecha: !fecha };
    if (missing.descripcion || missing.creditos || missing.fecha) {
      setActivityErrors(missing);
      return;
    }
    setActivityErrors({});
    setActionError(null);
    try {
      await crearActividad({ descripcion, creditos: Number(creditos), fecha, estado });
      setFormActividad({ descripcion: '', creditos: '', fecha: '', estado: 'pendiente' });
      await cargarDatos();
    } catch (err) {
      setActionError(crearErrorAccion(err, 'Error al agregar actividad'));
    }
  };

  const handleEliminarActividad = async (id) => {
    setActionError(null);
    try {
      await eliminarActividad(id);
      await cargarDatos();
    } catch (err) {
      setActionError(crearErrorAccion(err, 'Error al eliminar actividad'));
    }
  };

  const tryAutoSaveFinal = (materiaId) => {
    const fechaInput = document.getElementById(`fecha-${materiaId}`);
    const notaInput = document.getElementById(`nota-${materiaId}`);
    if (!fechaInput || !notaInput) return;
    const fecha = fechaInput.value;
    if (notaInput.value === '') return;
    const nota = Number(notaInput.value);
    if (fecha && !Number.isNaN(nota) && nota >= 0 && nota <= 10) {
      handleAgregarFinal(materiaId);
    }
  };

  const handleAgregarFinal = async (materiaId) => {
    const fechaInput = document.getElementById(`fecha-${materiaId}`);
    const notaInput = document.getElementById(`nota-${materiaId}`);

    if (!fechaInput || !notaInput) return;

    const fecha = fechaInput.value;
    const notaRaw = notaInput.value;
    const nota = Number(notaInput.value);
    const missingFecha = !fecha;
    const missingNota = notaRaw === '' || Number.isNaN(nota) || nota < 0 || nota > 10;

    if (missingFecha || missingNota) {
      setFinalErrors((prev) => ({ ...prev, [materiaId]: { fecha: missingFecha, nota: missingNota } }));
      return;
    }

    setFinalErrors((prev) => {
      const next = { ...prev };
      delete next[materiaId];
      return next;
    });

    const materia = data.subjects.find((s) => s.materia_id === materiaId);

    if (!materia?.estado_materia_id) {
      setActionError({ message: 'No se encontró el estado académico de esta materia', violations: [] });
      return;
    }

    setActionError(null);
    try {
      await crearFinal({
        estado_materia_id: materia.estado_materia_id,
        fecha,
        nota,
        aprobado: nota >= 4,
      });

      await cargarDatos(true);
    } catch (err) {
      setActionError(crearErrorAccion(err, 'Error al agregar final'));
    }
  };

  const handleEliminarFinal = async (id) => {
    if (!confirm('¿Eliminar este final?')) return;
    setActionError(null);
    try {
      await eliminarFinal(id);
      await cargarDatos(true);
    } catch (err) {
      setActionError(crearErrorAccion(err, 'Error al eliminar final'));
    }
  };

  const handleActualizarFinal = async (finalId, fecha, nota) => {
    setActionError(null);
    try {
      await actualizarFinal(finalId, { fecha, nota });
      await cargarDatos(true);
    } catch (err) {
      setActionError(crearErrorAccion(err, 'Error al actualizar final'));
    }
  };

  const handleSeleccionarExcel = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    setArchivoExcel(archivo);
  };

  const handleImportarExcel = async () => {
    if (!archivoExcel) return;
    setExcelLoading(true);
    setActionError(null);
    try {
      const fd = new FormData();
      fd.append('archivo', archivoExcel);
      const res = await importarExcel(fd);
      const { preview, errors, creditActivities } = res?.data ?? {};
      setExcelErrors(errors ?? []);
      setPreviewExcel(preview ?? []);
      setCreditActivitiesPreview(creditActivities ?? []);
    } catch (err) {
      setActionError(crearErrorAccion(err, 'Error al importar Excel'));
    } finally {
      setExcelLoading(false);
    }
  };

  const handleConfirmarExcel = async () => {
    if (!previewExcel) return;
    setSaving(true);
    setActionError(null);
    try {
      await confirmarImportacion(previewExcel, creditActivitiesPreview);
      setPreviewExcel(null);
      setCreditActivitiesPreview([]);
      setExcelErrors([]);
      setArchivoExcel(null);
      setMostrarCargaExcel(false);
      await cargarDatos();
    } catch (err) {
      setActionError(crearErrorAccion(err, 'Error al confirmar importación'));
    } finally {
      setSaving(false);
    }
  };

  const handleDescargarPlantilla = async () => {
    try {
      const { blob, filename } = await descargarPlantillaExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'plantilla_situacion_academica.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(crearErrorAccion(err, 'No se pudo descargar la plantilla'));
    }
  };

  if (sinSituacion || cambiandoCarrera) {
    return (
      <WizardPlan
        mode={cambiandoCarrera ? 'change' : 'create'}
        currentPlanId={data?.situation?.plan_id}
        onCancel={() => setCambiandoCarrera(false)}
        onCreated={async () => {
          setCambiandoCarrera(false);
          await cargarDatos();
        }}
      />
    );
  }

  if (loading) return <p className={styles.loading}>Cargando situación académica...</p>;

  if (loadError) return <p className={styles.loading}>{loadError}</p>;

  if (!data) return <p className={styles.loading}>No hay datos disponibles</p>;

  const { stats, subjects, credit_activities } = data;
  const estadosPorMateria = new Map(
    subjects.map((materia) => [Number(materia.materia_id), normalizarEstado(materia.status)])
  );
  const incumplimientosBorrador = editandoMaterias
    ? obtenerIncumplimientosBorrador(subjects)
    : [];
  const snapshotPorMateria = new Map(
    (backupSubjects || []).map((materia) => [Number(materia.materia_id), materia])
  );
  const hayCambiosMateriasSinGuardar = editandoMaterias && subjects.some((materia) => {
    const snapshot = snapshotPorMateria.get(Number(materia.materia_id));
    return snapshot && CAMPOS_MATERIA_EDITABLES.some(
      (campo) => (materia[campo] ?? null) !== (snapshot[campo] ?? null)
    );
  });

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
              <button
                type="button"
                className={styles.primaryButton}
                onClick={guardarCambios}
                disabled={saving || incumplimientosBorrador.length > 0}
              >
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
                setActionError(null);
                setEditandoMaterias(true);
              }
            }}>
              ✎ {editandoMaterias ? 'Cancelar' : 'Editar'}
            </button>
          </div>
        </div>

        <ActionError error={actionError} />

        {hayCambiosMateriasSinGuardar && (
          <p className={styles.hintText}>
            Guardá o cancelá los cambios de materias antes de modificar finales.
          </p>
        )}

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
            <p className={styles.excelSubtitle}>
              <button type="button" className={styles.templateLink} onClick={handleDescargarPlantilla}>
                Descargar plantilla Excel
              </button>
            </p>
            <div className={styles.excelIcon}>⇧</div>
            <p className={styles.excelTitle}>Arrastra tu archivo Excel aquí</p>
            <p className={styles.excelSubtitle}>o haz clic para seleccionar</p>
            <button type="button" className={styles.excelButton} onClick={() => inputExcelRef.current?.click()}>
              Seleccionar archivo
            </button>
            {archivoExcel && <p className={styles.excelFileName}>Archivo seleccionado: {archivoExcel.name}</p>}

            {excelLoading && (
              <div className={styles.excelLoadingOverlay}>
                <div className={styles.spinner} />
                <p>Procesando archivo...</p>
              </div>
            )}

            {archivoExcel && !previewExcel && !excelLoading && (
              <button type="button" className={styles.primaryButton} style={{ marginTop: 12 }} onClick={handleImportarExcel}>
                Previsualizar
              </button>
            )}

            {excelErrors.length > 0 && (
              <div className={styles.excelErrors}>
                <h4>Errores en el archivo ({excelErrors.length})</h4>
                <ul className={styles.excelErrorList}>
                  {excelErrors.map((e, i) => (
                    <li key={i} className={styles.excelErrorItem}>
                      <span className={styles.excelErrorRow}>Fila {e.row}</span>
                      <span className={styles.excelErrorMateria}>{e.materia}</span>
                      <span className={styles.excelErrorDetail}>{e.errors.join('; ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {previewExcel && (previewExcel.length > 0 || creditActivitiesPreview.length > 0) && (
              <div className={styles.excelPreview}>
                <h4>Vista previa de la importación</h4>
                <p className={styles.excelPreviewSummary}>
                  {previewExcel.length} materia(s) válida(s)
                  {creditActivitiesPreview.length > 0 && ` + ${creditActivitiesPreview.length} actividad(es) con crédito`}
                  {excelErrors.length > 0 && ` · ${excelErrors.length} error(es)`}
                </p>

                {previewExcel.length > 0 && (
                  <table className={`${styles.table} ${styles.excelPreviewTable}`}>
                    <thead>
                      <tr>
                        <th>Materia</th>
                        <th>Estado</th>
                        <th>Año</th>
                        <th>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewExcel.map((row, i) => {
                        const materia = data?.subjects?.find(s => s.materia_id === row.materia_id);
                        return (
                          <tr key={i}>
                            <td>{materia?.name || `ID ${row.materia_id}`}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[`badge${row.estado.charAt(0).toUpperCase() + row.estado.slice(1)}`] || ''}`}>
                                {row.estado}
                              </span>
                            </td>
                            <td>{row.anio || '-'}</td>
                            <td>{row.nota ?? '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {creditActivitiesPreview.length > 0 && (
                  <div className={styles.excelCreditPreview}>
                    <h5>Actividades con crédito</h5>
                    {creditActivitiesPreview.map((act, i) => (
                      <p key={i}>{act.descripcion} — {act.creditos} crédito(s)</p>
                    ))}
                  </div>
                )}

                <div className={styles.excelPreviewActions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => {
                    setPreviewExcel(null);
                    setCreditActivitiesPreview([]);
                    setExcelErrors([]);
                    setArchivoExcel(null);
                  }}>
                    Cancelar
                  </button>
                  <button type="button" className={styles.primaryButton} onClick={handleConfirmarExcel} disabled={saving || previewExcel.length === 0}>
                    {saving ? 'Importando...' : 'Confirmar importación'}
                  </button>
                </div>
              </div>
            )}

            {excelErrors.length > 0 && (!previewExcel || (previewExcel.length === 0 && creditActivitiesPreview.length === 0)) && (
              <p className={styles.hintText}>Corregí los errores en el archivo y volvé a intentar.</p>
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
                              {ESTADOS.map((est) => (
                                <option
                                  key={est}
                                  value={est}
                                  disabled={est !== 'pendiente' && !cumpleCorrelativas(materia, estadosPorMateria)}
                                >
                                  {est}
                                </option>
                              ))}
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
                          {materia.semester_in_plan ? `${materia.semester_in_plan}°` : '-'}
                        </td>
                        <td className={styles.gradeCell} data-label="Nota">
                          {editandoMaterias ? (
                            <input type="number" min="0" max="10" step="0.1" value={materia.grade ?? ''} onChange={(e) => {
                              const nota = e.target.value ? Math.max(0, Math.min(10, Number(e.target.value))) : null;
                              actualizarMateriaLocal(materia.materia_id, 'grade', nota);
                              if (nota !== null) {
                                if (nota >= 7) {
                                  actualizarMateriaLocal(materia.materia_id, 'status', 'aprobada');
                                } else if (nota >= 4) {
                                  actualizarMateriaLocal(materia.materia_id, 'status', 'regular');
                                } else if (materia.status === 'aprobada' || materia.status === 'regular') {
                                  actualizarMateriaLocal(materia.materia_id, 'status', 'pendiente');
                                }
                              }
                            }} />
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
                                    <input type="date" disabled={hayCambiosMateriasSinGuardar || saving} defaultValue={f.fecha?.split('T')[0]} style={{ width: 120, fontSize: 11 }}
                                      onChange={(e) => {
                                        f._fecha = e.target.value;
                                        handleActualizarFinal(f.id, e.target.value, f._nota ?? f.nota);
                                      }} />
                                    <input type="number" disabled={hayCambiosMateriasSinGuardar || saving} min="0" max="10" step="0.1" defaultValue={f.nota} style={{ width: 50, fontSize: 11 }}
                                      onChange={(e) => { const v = Math.max(0, Math.min(10, Number(e.target.value) || 0)); e.target.value = v; f._nota = v; }}
                                      onBlur={() => {
                                        const notaFinal = f._nota ?? f.nota;
                                        handleActualizarFinal(f.id, f._fecha || f.fecha, notaFinal);
                                      }} />
                                    <button type="button" disabled={hayCambiosMateriasSinGuardar || saving} className={styles.smallBtn} onClick={() => handleEliminarFinal(f.id)}>✕</button>
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
                                <input type="date" disabled={hayCambiosMateriasSinGuardar || saving} id={`fecha-${materia.materia_id}`} style={{ width: 120, fontSize: 11, ...(finalErrors[materia.materia_id]?.fecha ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}) }} onChange={() => setFinalErrors((prev) => { const next = { ...prev }; if (next[materia.materia_id]) { next[materia.materia_id] = { ...next[materia.materia_id], fecha: false }; } return next; })} onBlur={() => tryAutoSaveFinal(materia.materia_id)} />
                                <input type="number" disabled={hayCambiosMateriasSinGuardar || saving} min="0" max="10" step="0.1" id={`nota-${materia.materia_id}`} style={{ width: 50, fontSize: 11, ...(finalErrors[materia.materia_id]?.nota ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}) }} placeholder="Nota" onChange={(e) => { e.target.value = Math.max(0, Math.min(10, Number(e.target.value) || 0)); setFinalErrors((prev) => { const next = { ...prev }; if (next[materia.materia_id]) { next[materia.materia_id] = { ...next[materia.materia_id], nota: false }; } return next; }); }} onBlur={() => tryAutoSaveFinal(materia.materia_id)} />
                                <button type="button" disabled={hayCambiosMateriasSinGuardar || saving} className={styles.smallBtn} onClick={() => handleAgregarFinal(materia.materia_id)}>+</button>
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
              <p className={styles.hintText}>
                Los estados y datos de cursada se guardan con este botón. Los finales se guardan inmediatamente.
              </p>
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
            <input type="text" placeholder="Descripción" value={formActividad.descripcion} onChange={(e) => { setFormActividad((p) => ({ ...p, descripcion: e.target.value })); setActivityErrors((p) => ({ ...p, descripcion: false })); }} style={activityErrors.descripcion ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}} />
            <select value={formActividad.estado || 'pendiente'} onChange={(e) => setFormActividad((p) => ({ ...p, estado: e.target.value }))}>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
            </select>
            <input type="number" min="0" step="0.1" placeholder="Créditos" value={formActividad.creditos} onChange={(e) => { setFormActividad((p) => ({ ...p, creditos: e.target.value ? Math.max(0, Number(e.target.value)) : '' })); setActivityErrors((p) => ({ ...p, creditos: false })); }} style={activityErrors.creditos ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}} />
            <input type="date" max={new Date().toISOString().split('T')[0]} value={formActividad.fecha} onChange={(e) => { setFormActividad((p) => ({ ...p, fecha: e.target.value })); setActivityErrors((p) => ({ ...p, fecha: false })); }} style={activityErrors.fecha ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {}} />
            <button type="button" className={styles.primaryButton} onClick={handleAgregarActividad}>Agregar</button>
          </div>
        )}
      </section>
    </section>
  );
}
