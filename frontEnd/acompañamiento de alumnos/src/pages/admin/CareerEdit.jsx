import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Check, X, Eye, TriangleAlert } from 'lucide-react';
import PageTitle from '../../components/common/PageTitle';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { getCarreras, updateCarrera } from '../../services/carreraService';
import { addPlanEstudio, updatePlanEstudio } from '../../services/planEstudioService';
import { mapCarreraFromApi } from './careers/mapCarrera';
import styles from './CareerEdit.module.css';

const PLAN_STATUS_OPTIONS = [
  { value: 'vigente', label: 'Vigente' },
  { value: 'transicion', label: 'En transición' },
  { value: 'discontinuado', label: 'Discontinuado' },
];

function CareerEdit() {
  const { careerId } = useParams();
  const navigate = useNavigate();

  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [form, setForm] = useState({ nombre: '', titulo: '', instituto: '', duracion_anios: 5 });
  const [plans, setPlans] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    anio: new Date().getFullYear(),
    estado: 'vigente',
    creditos_requeridos: 100,
    niveles_ingles_requeridos: 1,
  });
  const [creatingPlan, setCreatingPlan] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCarreras();
        if (cancelled) return;
        const allCareers = (res?.data ?? []).map(mapCarreraFromApi);
        const found = allCareers.find((c) => String(c.id) === String(careerId));
        if (!found) {
          setLoadError('Carrera no encontrada');
          setLoading(false);
          return;
        }
        setCareer(found);
        setForm({
          nombre: found.name,
          titulo: found.title,
          instituto: found.faculty,
          duracion_anios: parseInt(found.duration) || 5,
        });
        setPlans(found.plans.map((p) => ({ ...p, _saving: false, _error: null })));
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err.message || 'No pudimos cargar la carrera.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [careerId]);

  const setFormField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSaveCareer = async () => {
    setSaveError(null);
    setSuccessMsg(null);
    if (!form.nombre.trim() || !form.titulo.trim() || !form.instituto.trim()) {
      setSaveError('Completá todos los campos obligatorios.');
      return;
    }
    setSaving(true);
    try {
      await updateCarrera(careerId, {
        nombre: form.nombre.trim(),
        titulo: form.titulo.trim(),
        instituto: form.instituto.trim(),
        duracion_anios: Number(form.duracion_anios),
      });
      setCareer((prev) => ({
        ...prev,
        name: form.nombre.trim(),
        title: form.titulo.trim(),
        faculty: form.instituto.trim(),
        duration: `${form.duracion_anios} años`,
      }));
      setSuccessMsg('Carrera actualizada correctamente.');
    } catch (err) {
      setSaveError(err.message || 'No pudimos guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handlePlanStatusChange = (planId, newStatus) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, status: newStatus } : p))
    );
  };

  const handleSavePlanStatus = async (planId) => {
    setSaveError(null);
    setSuccessMsg(null);
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, _saving: true, _error: null } : p))
    );

    try {
      const statusMap = { Vigente: 'vigente', 'En transición': 'transicion', Discontinuado: 'discontinuado' };
      await updatePlanEstudio(planId, { estado: statusMap[plan.status] || 'vigente' });
      setPlans((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, _saving: false } : p))
      );
      setSuccessMsg(`Estado del plan ${plan.year} actualizado.`);
    } catch (err) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === planId ? { ...p, _saving: false, _error: err.message || 'Error al actualizar' } : p
        )
      );
    }
  };

  const openPlanModal = () => {
    setNewPlan({
      anio: new Date().getFullYear(),
      estado: 'vigente',
      creditos_requeridos: 100,
      niveles_ingles_requeridos: 1,
    });
    setPlanModalOpen(true);
  };

  const handleCreatePlan = async () => {
    setSaveError(null);
    setSuccessMsg(null);
    if (!newPlan.anio) {
      setSaveError('Indicá el año del plan.');
      return;
    }
    setCreatingPlan(true);
    try {
      const res = await addPlanEstudio(careerId, {
        anio: Number(newPlan.anio),
        estado: newPlan.estado,
        creditos_requeridos: Number(newPlan.creditos_requeridos),
        niveles_ingles_requeridos: Number(newPlan.niveles_ingles_requeridos),
      });
      const created = res?.data ?? {};
      const newPlanObj = {
        id: created.id,
        year: created.anio || newPlan.anio,
        status: created.estado
          ? created.estado.charAt(0).toUpperCase() + created.estado.slice(1)
          : PLAN_STATUS_OPTIONS.find((o) => o.value === newPlan.estado)?.label || 'Vigente',
        _saving: false,
        _error: null,
      };
      setPlans((prev) => [...prev, newPlanObj]);
      setPlanModalOpen(false);
      setSuccessMsg(`Plan ${newPlan.anio} agregado correctamente.`);
    } catch (err) {
      setSaveError(err.message || 'No pudimos crear el plan.');
    } finally {
      setCreatingPlan(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Vigente': return styles.statusVigente;
      case 'En transición': return styles.statusTransicion;
      case 'Discontinuado': return styles.statusDiscontinuado;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.statusText}>Cargando carrera…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.container}>
        <PageTitle title="Editar carrera" description="Menú de edición de carrera" />
        <div className={styles.errorBox}>
          <TriangleAlert size={20} />
          <span>{loadError}</span>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/careers')}>
          <ArrowLeft size={16} /> Volver a carreras
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageTitle
        title="Editar carrera"
        description={`Editando: ${career?.name}`}
      />

      <button
        type="button"
        className={styles.backLink}
        onClick={() => navigate('/admin/careers')}
      >
        <ArrowLeft size={16} /> Volver a carreras
      </button>

      {successMsg && (
        <div className={styles.successBox}>
          <Check size={16} /> {successMsg}
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Datos de la carrera</h2>
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span>Nombre *</span>
            <input
              value={form.nombre}
              onChange={(e) => setFormField('nombre', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={styles.field}>
            <span>Título *</span>
            <input
              value={form.titulo}
              onChange={(e) => setFormField('titulo', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={styles.field}>
            <span>Facultad / Instituto *</span>
            <input
              value={form.instituto}
              onChange={(e) => setFormField('instituto', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={styles.field}>
            <span>Duración (años) *</span>
            <input
              type="number"
              min={1}
              max={6}
              value={form.duracion_anios}
              onChange={(e) => {
                const value = Math.min(6, Math.max(1, Number(e.target.value) || 1));
                setFormField('duracion_anios', value);
              }}
              disabled={saving}
            />
          </label>
        </div>

        {saveError && <p className={styles.errorMsg}>{saveError}</p>}

        <div className={styles.actionRow}>
          <Button
            variant="gradient"
            iconLeft={<Save size={16} />}
            onClick={handleSaveCareer}
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Guardar carrera'}
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Planes de estudio</h2>
          <Button
            variant="outline"
            size="sm"
            iconLeft={<Plus size={16} />}
            onClick={openPlanModal}
          >
            Agregar plan
          </Button>
        </div>

        {plans.length === 0 && (
          <p className={styles.emptyText}>Esta carrera aún no tiene planes de estudio.</p>
        )}

        <div className={styles.planList}>
          {plans.map((plan) => (
            <div key={plan.id} className={styles.planCard}>
              <div className={styles.planInfo}>
                <span className={styles.planYear}>Plan {plan.year}</span>
                <span className={`${styles.planBadge} ${getStatusClass(plan.status)}`}>
                  {plan.status}
                </span>
              </div>
              <div className={styles.planActions}>
                <label className={styles.field}>
                  <span>Estado</span>
                  <select
                    value={plan.status}
                    onChange={(e) => handlePlanStatusChange(plan.id, e.target.value)}
                    disabled={plan._saving}
                  >
                    {PLAN_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  variant="gradient"
                  size="sm"
                  iconLeft={plan._saving ? null : <Check size={14} />}
                  onClick={() => handleSavePlanStatus(plan.id)}
                  disabled={plan._saving}
                >
                  {plan._saving ? 'Guardando…' : 'Actualizar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconLeft={<Eye size={14} />}
                  onClick={() => navigate('/admin/study-plan', { state: { planId: plan.id } })}
                >
                  Ver plan
                </Button>
              </div>
              {plan._error && <p className={styles.planError}>{plan._error}</p>}
            </div>
          ))}
        </div>
      </section>

      <Modal
        open={planModalOpen}
        title="Agregar plan de estudio"
        onClose={() => setPlanModalOpen(false)}
        size="md"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="outline" onClick={() => setPlanModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={handleCreatePlan}
              disabled={creatingPlan}
            >
              {creatingPlan ? 'Creando…' : 'Crear plan'}
            </Button>
          </div>
        }
      >
        <div className={styles.modalForm}>
          <label className={styles.field}>
            <span>Año del plan *</span>
            <input
              type="number"
              min={1900}
              max={2100}
              value={newPlan.anio}
              onChange={(e) => setNewPlan((s) => ({ ...s, anio: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>Estado</span>
            <select
              value={newPlan.estado}
              onChange={(e) => setNewPlan((s) => ({ ...s, estado: e.target.value }))}
            >
              {PLAN_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Créditos requeridos *</span>
            <input
              type="number"
              min={0}
              value={newPlan.creditos_requeridos}
              onChange={(e) => setNewPlan((s) => ({ ...s, creditos_requeridos: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>Niveles de inglés requeridos *</span>
            <input
              type="number"
              min={0}
              max={10}
              value={newPlan.niveles_ingles_requeridos}
              onChange={(e) => setNewPlan((s) => ({ ...s, niveles_ingles_requeridos: e.target.value }))}
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}

export default CareerEdit;
