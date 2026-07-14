import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { createCarrera, getMateriasAdmin } from '../../services/carreraService';
import styles from './CareerForm.module.css';

const EMPTY_MATERIA = {
  codigo: '',
  nombre: '',
  anio_cursada: 1,
  modalidad: 'Cuatrimestral',
  es_optativa: false,
  es_unahur: false,
  creditos_otorga: 0,
  correlativas: [],
};

function CareerForm({ onCancel, onCreated }) {
  const [carrera, setCarrera] = useState({
    nombre: '',
    titulo: '',
    instituto: '',
    duracion_anios: 5,
  });

  const [plan, setPlan] = useState({
    anio: new Date().getFullYear(),
    estado: 'vigente',
    creditos_requeridos: 100,
    niveles_ingles_requeridos: 1,
  });

  const [materias, setMaterias] = useState([]);
  const [draft, setDraft] = useState({ ...EMPTY_MATERIA });
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftMode, setDraftMode] = useState('nueva');
  const [existingMaterias, setExistingMaterias] = useState([]);
  const [pickedExistingId, setPickedExistingId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    getMateriasAdmin()
      .then((res) => setExistingMaterias(res?.data ?? []))
      .catch(() => setExistingMaterias([]));
  }, []);

  const setCarreraField = (k, v) => setCarrera((s) => ({ ...s, [k]: v }));
  const setPlanField = (k, v) => setPlan((s) => ({ ...s, [k]: v }));
  const setDraftField = (k, v) => setDraft((s) => ({ ...s, [k]: v }));

  const openDraft = () => {
    setDraft({ ...EMPTY_MATERIA });
    setDraftMode('nueva');
    setPickedExistingId('');
    setDraftOpen(true);
  };

  const cancelDraft = () => {
    setDraftOpen(false);
    setDraft({ ...EMPTY_MATERIA });
    setPickedExistingId('');
  };

  const pickExisting = (id) => {
    setPickedExistingId(id);
    if (!id) return;
    const existing = existingMaterias.find((m) => String(m.id) === String(id));
    if (existing) {
      setDraft({
        codigo: existing.codigo ?? '',
        nombre: existing.nombre ?? '',
        anio_cursada: existing.anio_cursada ?? 1,
        modalidad: existing.modalidad ?? 'Cuatrimestral',
        es_optativa: !!existing.es_optativa,
        es_unahur: !!existing.es_unahur,
        creditos_otorga: existing.creditos_otorga ?? 0,
        correlativas: [],
      });
    }
  };

  const addDraftMateria = () => {
    setSubmitError(null);
    if (!draft.codigo.trim() || !draft.nombre.trim()) {
      setSubmitError('La materia necesita código y nombre.');
      return;
    }
    if (materias.some((m) => m.codigo === draft.codigo.trim())) {
      setSubmitError(`Ya hay una materia con el código "${draft.codigo}" en este plan.`);
      return;
    }
    setMaterias([...materias, { ...draft, codigo: draft.codigo.trim() }]);
    cancelDraft();
  };

  const removeMateria = (codigo) => {
    setMaterias(
      materias
        .filter((m) => m.codigo !== codigo)
        .map((m) => ({
          ...m,
          correlativas: (m.correlativas || []).filter((c) => c.codigo !== codigo),
        }))
    );
  };

  const toggleCorrelativa = (codigo) => {
    setDraft((s) => {
      const has = (s.correlativas || []).some((c) => c.codigo === codigo);
      return {
        ...s,
        correlativas: has
          ? s.correlativas.filter((c) => c.codigo !== codigo)
          : [...(s.correlativas || []), { codigo, tipo: 'cursar' }],
      };
    });
  };

  const setCorrelativaTipo = (codigo, tipo) => {
    setDraft((s) => ({
      ...s,
      correlativas: (s.correlativas || []).map((c) =>
        c.codigo === codigo ? { ...c, tipo } : c
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    if (!carrera.nombre.trim() || !carrera.titulo.trim() || !carrera.instituto.trim()) {
      setSubmitError('Completá los datos básicos de la carrera.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nombre: carrera.nombre.trim(),
        titulo: carrera.titulo.trim(),
        instituto: carrera.instituto.trim(),
        duracion_anios: Number(carrera.duracion_anios),
        plan: {
          anio: Number(plan.anio),
          estado: plan.estado,
          creditos_requeridos: Number(plan.creditos_requeridos),
          niveles_ingles_requeridos: Number(plan.niveles_ingles_requeridos),
        },
        materias: materias.map((m) => ({
          codigo: m.codigo,
          nombre: m.nombre.trim(),
          anio_cursada: Number(m.anio_cursada),
          modalidad: m.modalidad,
          es_optativa: !!m.es_optativa,
          es_unahur: !!m.es_unahur,
          creditos_otorga: Number(m.creditos_otorga),
          correlativas: m.correlativas || [],
        })),
      };

      await createCarrera(payload);
      onCreated?.();
    } catch (err) {
      setSubmitError(err.message || 'No pudimos crear la carrera.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Datos de la carrera</h3>
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>Nombre *</span>
            <input
              value={carrera.nombre}
              onChange={(e) => setCarreraField('nombre', e.target.value)}
              disabled={submitting}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Título *</span>
            <input
              value={carrera.titulo}
              onChange={(e) => setCarreraField('titulo', e.target.value)}
              disabled={submitting}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Facultad / Instituto *</span>
            <input
              value={carrera.instituto}
              onChange={(e) => setCarreraField('instituto', e.target.value)}
              disabled={submitting}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Duración (años) *</span>
            <input
              type="number"
              min={1}
              max={10}
              value={carrera.duracion_anios}
              onChange={(e) => setCarreraField('duracion_anios', e.target.value)}
              disabled={submitting}
              required
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Plan de estudio inicial</h3>
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>Año del plan *</span>
            <input
              type="number"
              min={1900}
              max={2100}
              value={plan.anio}
              onChange={(e) => setPlanField('anio', e.target.value)}
              disabled={submitting}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Estado</span>
            <select
              value={plan.estado}
              onChange={(e) => setPlanField('estado', e.target.value)}
              disabled={submitting}
            >
              <option value="vigente">Vigente</option>
              <option value="transicion">Transicion</option>
              <option value="discontinuado">Discontinuado</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Créditos requeridos *</span>
            <input
              type="number"
              min={0}
              value={plan.creditos_requeridos}
              onChange={(e) => setPlanField('creditos_requeridos', e.target.value)}
              disabled={submitting}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Niveles de inglés requeridos *</span>
            <input
              type="number"
              min={0}
              max={10}
              value={plan.niveles_ingles_requeridos}
              onChange={(e) => setPlanField('niveles_ingles_requeridos', e.target.value)}
              disabled={submitting}
              required
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Materias del plan</h3>
          {!draftOpen && (
            <button
              type="button"
              className={styles.addBtn}
              onClick={openDraft}
              disabled={submitting}
            >
              <Plus size={16} /> Agregar materia
            </button>
          )}
        </div>

        {materias.length === 0 && !draftOpen && (
          <p className={styles.empty}>Aún no agregaste materias al plan.</p>
        )}

        <ul className={styles.materiaList}>
          {materias.map((m) => (
            <li key={m.codigo} className={styles.materiaItem}>
              <div className={styles.materiaInfo}>
                <strong className={styles.materiaCodigo}>{m.codigo}</strong>
                <span>{m.nombre}</span>
                <span className={styles.materiaMeta}>
                  Año {m.anio_cursada} · {m.modalidad} · {m.creditos_otorga} créd.
                  {m.es_optativa ? ' · Optativa' : ''}
                  {m.es_unahur ? ' · UNAHUR' : ''}
                </span>
                {m.correlativas?.length > 0 && (
                  <span className={styles.materiaMeta}>
                    Correlativas:{' '}
                    {m.correlativas
                      .map((c) => `${c.codigo} (${c.tipo === 'aprobar' ? 'aprobar' : 'cursar'})`)
                      .join(', ')}
                  </span>
                )}
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeMateria(m.codigo)}
                disabled={submitting}
                aria-label="Eliminar materia"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>

        {draftOpen && (
          <div className={styles.draftCard}>
            <div className={styles.draftTabs}>
              <button
                type="button"
                className={`${styles.tab} ${draftMode === 'nueva' ? styles.tabActive : ''}`}
                onClick={() => setDraftMode('nueva')}
              >
                Nueva materia
              </button>
              <button
                type="button"
                className={`${styles.tab} ${draftMode === 'existente' ? styles.tabActive : ''}`}
                onClick={() => setDraftMode('existente')}
              >
                Cargar existente
              </button>
            </div>

            {draftMode === 'existente' && (
              <label className={styles.field}>
                <span>Elegí una materia existente</span>
                <select value={pickedExistingId} onChange={(e) => pickExisting(e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  {existingMaterias.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.codigo} · {m.nombre} ({m.plan_nombre ?? '—'})
                    </option>
                  ))}
                </select>
                <small className={styles.hint}>
                  Vas a poder editar los campos antes de agregarla.
                </small>
              </label>
            )}

            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>Código *</span>
                <input
                  value={draft.codigo}
                  onChange={(e) => setDraftField('codigo', e.target.value)}
                  placeholder="INF101"
                />
              </label>
              <label className={styles.field}>
                <span>Nombre *</span>
                <input
                  value={draft.nombre}
                  onChange={(e) => setDraftField('nombre', e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>Año de cursada</span>
                <select
                  value={draft.anio_cursada}
                  onChange={(e) => setDraftField('anio_cursada', Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}°
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Modalidad</span>
                <select
                  value={draft.modalidad}
                  onChange={(e) => setDraftField('modalidad', e.target.value)}
                >
                  <option value="Cuatrimestral">Cuatrimestral</option>
                  <option value="Anual">Anual</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Créditos que otorga</span>
                <input
                  type="number"
                  min={0}
                  value={draft.creditos_otorga}
                  onChange={(e) => setDraftField('creditos_otorga', Number(e.target.value))}
                />
              </label>
              <div className={styles.checkboxRow}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={draft.es_optativa}
                    onChange={(e) => setDraftField('es_optativa', e.target.checked)}
                  />
                  Optativa
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={draft.es_unahur}
                    onChange={(e) => setDraftField('es_unahur', e.target.checked)}
                  />
                  UNAHUR
                </label>
              </div>
            </div>

            {materias.length > 0 && (
              <div className={styles.field}>
                <span>Correlativas (materias ya agregadas al plan)</span>
                <div className={styles.correlativasGrid}>
                  {materias.map((m) => {
                    const correlativa = (draft.correlativas || []).find(
                      (c) => c.codigo === m.codigo
                    );
                    return (
                      <div key={m.codigo} className={styles.correlativaOption}>
                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={Boolean(correlativa)}
                            onChange={() => toggleCorrelativa(m.codigo)}
                          />
                          {m.codigo}
                        </label>
                        {correlativa && (
                          <select
                            className={styles.correlativaType}
                            value={correlativa.tipo}
                            onChange={(e) => setCorrelativaTipo(m.codigo, e.target.value)}
                            aria-label={`Tipo de correlativa ${m.codigo}`}
                          >
                            <option value="cursar">Para cursar</option>
                            <option value="aprobar">Para aprobar</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.draftActions}>
              <button type="button" className={styles.cancelBtn} onClick={cancelDraft}>
                Cancelar
              </button>
              <button type="button" className={styles.primaryBtn} onClick={addDraftMateria}>
                Agregar al plan
              </button>
            </div>
          </div>
        )}
      </section>

      {submitError && <p className={styles.errorBox}>{submitError}</p>}

      <footer className={styles.formFooter}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
        <button type="submit" className={styles.primaryBtn} disabled={submitting}>
          {submitting ? 'Creando…' : 'Crear carrera'}
        </button>
      </footer>
    </form>
  );
}

export default CareerForm;
