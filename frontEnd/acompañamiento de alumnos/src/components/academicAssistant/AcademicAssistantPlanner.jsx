import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Save,
  GripVertical,
  Wand2,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import Card from '../common/Card';
import ErrorState from '../common/ErrorState';
import { getCareerSubjects } from '../../services/plannerService';
import { guardarPlanCursada, obtenerPlanesCursada, eliminarPlanCursada } from '../../services/situacionAcademicaService';
import styles from './AcademicAssistantPlanner.module.css';

function AcademicAssistantPlanner({ approvedIds = [] }) {
  const [classHours, setClassHours] = useState(20);
  const [extraCap, setExtraCap] = useState(10);
  const [plan, setPlan] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [materiasNombres, setMateriasNombres] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelDraft, setLabelDraft] = useState('');
  const [expandedCorr, setExpandedCorr] = useState({});
  const [nombrePlan, setNombrePlan] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [planesGuardados, setPlanesGuardados] = useState([]);
  const [planningBlocked, setPlanningBlocked] = useState(false);
  const [blockedSubjects, setBlockedSubjects] = useState([]);
  const [activePlanTab, setActivePlanTab] = useState('nuevo');
  const dragSource = useRef(null);
  const labelInputRef = useRef(null);
  const workingPlanRef = useRef([]);

  const approvedSet = useMemo(() => new Set(approvedIds), [approvedIds]);

  const subjectNameMap = useMemo(() => {
    const map = {};
    for (const s of allSubjects) map[s.id] = s.name;
    return map;
  }, [allSubjects]);

  const requirementsFor = (subject) => subject.correlativeRequirements?.length
    ? subject.correlativeRequirements
    : (subject.correlatives || []).map((subjectId) => ({
      subjectId,
      type: 'aprobar',
      currentStatus: approvedSet.has(subjectId) ? 'aprobada' : 'pendiente',
    }));

  const corrSatisfecha = (requirement, earlierIds) => {
    if (earlierIds.has(Number(requirement.subjectId))) return true;
    const status = requirement.currentStatus || 'pendiente';
    return ['aprobada', 'regular', 'cursando'].includes(status);
  };

  function filterSubjects(subjects) {
    return subjects;
  }

  function nextLabel() {
    let n = 1;
    while (plan.some((g) => g.label === `Cuatrimestre ${n}`)) n++;
    return `Cuatrimestre ${n}`;
  }

  const cargarPlanesGuardados = async () => {
    try {
      const res = await obtenerPlanesCursada();
      setPlanesGuardados(res?.data || []);
    } catch {
      setPlanesGuardados([]);
    }
  };

  useEffect(() => {
    getCareerSubjects()
      .then((data) => {
        const subjects = data.subjects || [];
        const currentPlan = data.currentPlan || [];

        setAllSubjects(subjects);
        setMateriasNombres(data.materiasNombres || {});
        setPlanningBlocked(!!data.planningBlocked);
        setBlockedSubjects(data.unplannableSubjects || []);
        setPlan(currentPlan);
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setLoading(false);
        cargarPlanesGuardados();
      });
  }, []);

  useEffect(() => {
    if (mensaje) {
      const t = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(t);
    }
  }, [mensaje]);

  const handleCargarPlan = (planData) => {
    const grupos = {};

    const items = planData.plan_cursada_items || [];

    for (const item of items) {
      const materia = allSubjects.find((s) => s.id === item.materia_id);

      const name =
        materia?.name ||
        item.materia?.nombre ||
        `Materia ${item.materia_id}`;
      const hours =
        item.horas ??
        item.materia?.carga_horaria_semanal ??
        materia?.hours ??
        6;
      const extraHours = item.horas_extra ?? 0;

      const key = `${item.anio_proyectado}-${item.cuatrimestre_proyectado}`;

      if (!grupos[key]) {
        grupos[key] = {
          year: item.anio_proyectado,
          cuatrimestre: item.cuatrimestre_proyectado,
          label: `Año ${item.anio_proyectado} - Cuatrimestre ${item.cuatrimestre_proyectado}`,
          subjects: [],
        };
      }

      grupos[key].subjects.push({
        id: item.materia_id,
        name,
        hours,
        correlatives: materia?.correlatives || [],
        correlativeRequirements: materia?.correlativeRequirements || [],
        extraHours,
      });
    }

    setPlan(
      Object.values(grupos).sort((a, b) =>
        a.year !== b.year ? a.year - b.year : a.cuatrimestre - b.cuatrimestre
      )
    );
  };

  const seleccionarNuevoPlan = () => {
    if (activePlanTab === 'nuevo') return;
    setActivePlanTab('nuevo');
    setPlan(workingPlanRef.current);
  };

  const seleccionarPlanGuardado = (planData) => {
    if (activePlanTab === 'nuevo') workingPlanRef.current = plan;
    setActivePlanTab(planData.id);
    handleCargarPlan(planData);
  };

  const handleEliminarPlanGuardado = async (id) => {
    try {
      await eliminarPlanCursada(id);
      setPlanesGuardados((prev) => prev.filter((p) => p.id !== id));
      if (activePlanTab === id) seleccionarNuevoPlan();
      setMensaje("Plan eliminado");
    } catch {
      setMensaje("Error al eliminar el plan");
    }
  };

  const handleGuardarPlan = async () => {
    const nombre = nombrePlan.trim() || `Plan ${new Date().toLocaleDateString("es-AR")}`;
    const items = [];
    for (const grupo of plan) {
      for (const sub of grupo.subjects) {
        items.push({
          materia_id: sub.id,
          anio_proyectado: grupo.year || 1,
          cuatrimestre_proyectado: grupo.cuatrimestre || 1,
          horas: sub.hours || 0,
          horas_extra: sub.extraHours || 0,
        });
      }
    }
    if (items.length === 0) {
      setMensaje("Agregá materias al plan antes de guardar");
      return;
    }
    setGuardando(true);
    try {
      await guardarPlanCursada({ nombre, items });
      setMensaje("Plan guardado correctamente");
      setNombrePlan('');
      await cargarPlanesGuardados();
    } catch (err) {
      setMensaje(err.message || "Error al guardar el plan");
    } finally {
      setGuardando(false);
    }
  };

  const handleGenerate = () => {
    const remaining = filterSubjects([...allSubjects]);
    const newPlan = [];
    const placedIds = new Set();
    let yearCursor = 1;
    let cuatriCursor = 1;
    let iterationGuard = 0;
    let blocked = [];

    const advanceCursor = () => {
      if (cuatriCursor === 1) {
        cuatriCursor = 2;
      } else {
        cuatriCursor = 1;
        yearCursor++;
      }
    };

    while (remaining.length > 0 && iterationGuard < 200) {
      iterationGuard++;

      const group = {
        year: yearCursor,
        cuatrimestre: cuatriCursor,
        label: `Año ${yearCursor} - Cuatrimestre ${cuatriCursor}`,
        subjects: [],
      };
      let groupHours = 0;

      // Las correlativas deben estar en un cuatrimestre anterior (no en este).
      const earlierIds = new Set(placedIds);

      for (let i = 0; i < remaining.length; i++) {
        const s = remaining[i];
        const met = requirementsFor(s).every(
          (requirement) => corrSatisfecha(requirement, earlierIds)
        );
        if (!met) continue;
        if (groupHours + s.hours > classHours) continue;

        group.subjects.push({
          id: s.id,
          name: s.name,
          hours: s.hours,
          correlatives: s.correlatives,
          correlativeRequirements: s.correlativeRequirements,
          extraHours: 0,
        });
        groupHours += s.hours;
        remaining.splice(i, 1);
        i--;
      }

      if (group.subjects.length > 0) {
        for (const sub of group.subjects) placedIds.add(sub.id);
        newPlan.push(group);
      } else if (remaining.length > 0) {
        const remainingIds = new Set(remaining.map((subject) => Number(subject.id)));
        blocked = remaining.map((subject) => {
          const reasons = [];
          if (subject.hours > classHours) {
            reasons.push({
              code: 'HOUR_LIMIT',
              message: `Requiere ${subject.hours}hs y supera el máximo de ${classHours}hs por cuatrimestre`,
            });
          }
          for (const requirement of requirementsFor(subject)) {
            if (corrSatisfecha(requirement, placedIds)) continue;
            const requirementId = Number(requirement.subjectId);
            reasons.push({
              code: remainingIds.has(requirementId)
                ? 'PENDING_PREREQUISITE'
                : 'MISSING_PREREQUISITE',
              requirementId,
              requirementName: materiasNombres[requirementId] || subjectNameMap[requirementId],
              message: remainingIds.has(requirementId)
                ? `La correlativa ${materiasNombres[requirementId] || subjectNameMap[requirementId] || requirementId} debe ubicarse en un cuatrimestre anterior`
                : `No se puede proyectar la correlativa ${materiasNombres[requirementId] || subjectNameMap[requirementId] || requirementId}`,
            });
          }
          return { id: subject.id, name: subject.name, reasons };
        });
        break;
      }

      advanceCursor();
    }

    for (const group of newPlan) {
      const subjects = group.subjects;
      const totalClass = subjects.reduce((s, sub) => s + sub.hours, 0);
      if (totalClass === 0) continue;
      let remaining = extraCap;
      for (let i = 0; i < subjects.length; i++) {
        if (i === subjects.length - 1) {
          subjects[i].extraHours = remaining;
        } else {
          const extra = Math.round((subjects[i].hours / totalClass) * extraCap);
          subjects[i].extraHours = Math.min(extra, remaining);
          remaining -= subjects[i].extraHours;
        }
      }
    }

    setPlan(newPlan);
    setBlockedSubjects(blocked);
    setPlanningBlocked(blocked.length > 0);
  };

  const fixedTotalHours = plan.reduce(
    (acc, group) => acc + group.subjects.reduce((s, sub) => s + sub.hours + (sub.extraHours || 0), 0),
    0
  );
  const fixedClassHours = plan.reduce(
    (acc, group) => acc + group.subjects.reduce((s, sub) => s + sub.hours, 0),
    0
  );
  const fixedExtraHours = plan.reduce(
    (acc, group) => acc + group.subjects.reduce((s, sub) => s + (sub.extraHours || 0), 0),
    0
  );

  const handleAddGroup = () => {
    setPlan((prev) => [
      ...prev,
      { year: null, cuatrimestre: null, label: nextLabel(), subjects: [] },
    ]);
  };

  const handleDeleteGroup = (groupIndex) => {
    setPlan((prev) => prev.filter((_, i) => i !== groupIndex));
  };

  const startLabelEdit = (groupIndex, currentLabel) => {
    setEditingLabel(groupIndex);
    setLabelDraft(currentLabel);
    setTimeout(() => labelInputRef.current?.focus(), 0);
  };

  const commitLabelEdit = (groupIndex) => {
    setPlan((prev) =>
      prev.map((g, i) => (i === groupIndex ? { ...g, label: labelDraft.trim() || g.label } : g))
    );
    setEditingLabel(null);
  };

  const handleLabelKeyDown = (e, groupIndex) => {
    if (e.key === 'Enter') commitLabelEdit(groupIndex);
    if (e.key === 'Escape') setEditingLabel(null);
  };

  const handleDragStart = (e, groupIndex, subjectIndex) => {
    dragSource.current = { groupIndex, subjectIndex };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetGroupIndex, targetSubjectIndex) => {
    e.preventDefault();
    if (!dragSource.current) return;

    const { groupIndex: fromGroup, subjectIndex: fromSubject } = dragSource.current;

    if (fromGroup === targetGroupIndex && fromSubject === targetSubjectIndex) {
      dragSource.current = null;
      return;
    }

    setPlan((prev) => {
      const newPlan = prev.map((g) => ({ ...g, subjects: [...g.subjects] }));
      const [moved] = newPlan[fromGroup].subjects.splice(fromSubject, 1);
      newPlan[targetGroupIndex].subjects.splice(targetSubjectIndex, 0, moved);
      return newPlan;
    });

    dragSource.current = null;
  };

  const handleDropOnGroup = (e, targetGroupIndex) => {
    e.preventDefault();
    if (!dragSource.current) return;

    const { groupIndex: fromGroup, subjectIndex: fromSubject } = dragSource.current;

    if (fromGroup === targetGroupIndex) {
      dragSource.current = null;
      return;
    }

    setPlan((prev) => {
      const newPlan = prev.map((g) => ({ ...g, subjects: [...g.subjects] }));
      const [moved] = newPlan[fromGroup].subjects.splice(fromSubject, 1);
      newPlan[targetGroupIndex].subjects.push(moved);
      return newPlan;
    });

    dragSource.current = null;
  };

  const handleDragEnd = () => {
    dragSource.current = null;
  };

  const toggleCorr = (subjectId) => {
    setExpandedCorr((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  const handleExtraChange = (groupIndex, subjectIndex, value) => {
    const v = Math.max(0, Math.min(20, Number(value) || 0));
    setPlan((prev) => {
      const newPlan = prev.map((g) => ({ ...g, subjects: [...g.subjects.map((s) => ({ ...s }))] }));
      newPlan[groupIndex].subjects[subjectIndex].extraHours = v;
      return newPlan;
    });
  };

  if (loading) {
    return (
      <div className={styles.planner}>
        <Card title="Planificador de cursada">
          <div className={styles.loadingState}>
            <Loader2 size={24} className={styles.spinner} />
            <p>Cargando materias...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.planner}>
        <Card title="Planificador de cursada">
          <ErrorState title="Error al cargar" description={error} />
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.planner}>
      <Card title="Planificador de cursada">
        <div className={styles.inputRow}>
          <label className={styles.label}>
            Horas de cursada por semana
            <input
              type="number"
              value={classHours}
              onChange={(e) => setClassHours(Number(e.target.value))}
              className={styles.input}
              min={1}
              max={80}
            />
          </label>
          <label className={styles.label}>
            Horas extra por semana
            <input
              type="number"
              value={extraCap}
              onChange={(e) => setExtraCap(Number(e.target.value))}
              className={styles.input}
              min={0}
              max={80}
            />
          </label>

          <button className={styles.generateButton} onClick={handleGenerate}>
            <Wand2 size={20} />
            Reorganizar por año
          </button>
        </div>

        <div className={styles.planHeader}>
          <p className={styles.dragHint}>
            Arrastrá las materias para reorganizar tu plan
          </p>
        </div>

        {mensaje && (
          <div className={styles.mensaje}>
            {mensaje}
          </div>
        )}
        {planningBlocked && activePlanTab === 'nuevo' && (
          <div className={styles.blockedMessage} role="alert">
            <strong>Hay materias que todavía no pueden ubicarse en el plan:</strong>
            <ul>
              {blockedSubjects.map((subject) => (
                <li key={subject.id}>
                  <span>{subject.name}</span>
                  {subject.reasons?.length > 0 && (
                    <>: {subject.reasons.map((reason) => reason.message).join('. ')}</>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.tabs}>
          <button
            className={activePlanTab === 'nuevo' ? styles.activeTab : ''}
            onClick={seleccionarNuevoPlan}
          >
            Nuevo plan
          </button>
          {planesGuardados.map((p) => (
            <button
              key={p.id}
              className={activePlanTab === p.id ? styles.activeTab : ''}
              onClick={() => seleccionarPlanGuardado(p)}
            >
              {p.nombre}
              <Trash2
                size={14}
                className={styles.tabDeleteIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEliminarPlanGuardado(p.id);
                }}
              />
            </button>
          ))}
        </div>

        <div className={styles.summary}>
          Total del plan: <strong>{fixedClassHours}hs</strong> cursada + <strong>{fixedExtraHours}hs</strong> extra = <strong>{fixedTotalHours}hs</strong> · máx. <strong>{classHours}hs</strong> cursada + <strong>{extraCap}hs</strong> extra por cuatrimestre
        </div>

        {plan.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay materias en el plan. Hacé clic en "Reorganizar por año" para comenzar.</p>
          </div>
        ) : (
          <div className={styles.groupsContainer}>
            {plan.map((group, groupIndex) => {
              const groupClassHours = group.subjects.reduce((s, sub) => s + sub.hours, 0);
              const groupExtraHours = group.subjects.reduce((s, sub) => s + (sub.extraHours || 0), 0);
              const groupTotal = groupClassHours + groupExtraHours;
              const isEmpty = group.subjects.length === 0;
              const overCap = groupTotal > (classHours + extraCap);

              return (
                <div
                  key={groupIndex}
                  className={`${styles.groupCard} ${isEmpty ? styles.groupCardEmpty : ''} ${overCap ? styles.groupCardOver : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnGroup(e, groupIndex)}
                >
                  <div className={styles.groupHeader}>
                    {editingLabel === groupIndex ? (
                      <input
                        ref={labelInputRef}
                        className={styles.labelInput}
                        value={labelDraft}
                        onChange={(e) => setLabelDraft(e.target.value)}
                        onBlur={() => commitLabelEdit(groupIndex)}
                        onKeyDown={(e) => handleLabelKeyDown(e, groupIndex)}
                      />
                    ) : (
                      <h4
                        className={styles.groupTitle}
                        onClick={() => startLabelEdit(groupIndex, group.label)}
                        title="Editar nombre"
                      >
                        {group.label}
                        <Pencil size={13} className={styles.editIcon} />
                      </h4>
                    )}
                    <div className={styles.groupHeaderRight}>
                      <span className={styles.groupHours}>
                        {overCap && <AlertTriangle size={14} className={styles.warnIconInline} />}
                        <span className={overCap ? styles.groupOver : ''}>{groupTotal}hs</span>
                        <span className={styles.groupCap}> / {classHours + extraCap}hs</span>
                      </span>
                      {isEmpty && (
                        <button
                          className={styles.deleteGroupButton}
                          onClick={() => handleDeleteGroup(groupIndex)}
                          title="Eliminar cuatrimestre"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.subjectsList}>
                    {group.subjects.map((subject, subjectIndex) => {
                      const isExpanded = expandedCorr[subject.id];
                      const hasCorr = subject.correlatives?.length > 0;
                      const earlierIds = new Set();
                      for (let g = 0; g < groupIndex; g++) {
                        for (const s of plan[g].subjects) earlierIds.add(s.id);
                      }
                      const corrUnmet = hasCorr && !requirementsFor(subject).every(
                        (requirement) => corrSatisfecha(requirement, earlierIds)
                      );

                      return (
                        <div key={subject.id}>
                          <div
                            draggable
                            className={`${styles.subjectItem} ${corrUnmet ? styles.subjectUnmet : ''}`}
                            onDragStart={(e) => handleDragStart(e, groupIndex, subjectIndex)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, groupIndex, subjectIndex)}
                            onDragEnd={handleDragEnd}
                          >
                            <GripVertical size={16} className={styles.gripIcon} />
                            <span className={styles.subjectName}>{subject.name}</span>
                            {hasCorr && (
                              <button
                                className={`${styles.corrButton} ${corrUnmet ? styles.corrUnmet : ''}`}
                                onClick={() => toggleCorr(subject.id)}
                                title="Ver correlativas"
                              >
                                {corrUnmet && <AlertTriangle size={13} className={styles.warnIconInline} />}
                                Correlativas
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                            )}
                            <span className={styles.subjectHours}>{subject.hours}hs</span>
                            <label className={styles.extraLabel}>
                              +
                              <input
                                type="number"
                                className={styles.extraInput}
                                value={subject.extraHours || 0}
                                onChange={(e) => handleExtraChange(groupIndex, subjectIndex, e.target.value)}
                                min={0}
                                max={20}
                              />hs
                            </label>
                          </div>
                          {isExpanded && hasCorr && (
                            <div className={styles.corrDropdown}>
                              <span className={styles.corrLabel}>Correlativas:</span>
                              {subject.correlatives.map((cId) => (
                                <span key={cId} className={styles.corrChip}>
                                  {materiasNombres[cId] || subjectNameMap[cId] || `ID ${cId}`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <button className={styles.addGroupButton} onClick={handleAddGroup}>
              <Plus size={18} />
              Agregar cuatrimestre
            </button>
          </div>
        )}

        <div className={styles.saveRow}>
          <input
            type="text"
            className={styles.nombreInput}
            placeholder="Nombre del plan (opcional)"
            value={nombrePlan}
            onChange={(e) => setNombrePlan(e.target.value)}
          />
          <button
            className={styles.saveButton}
            onClick={handleGuardarPlan}
            disabled={guardando || plan.length === 0}
          >
            <Save size={16} />
            {guardando ? 'Guardando...' : 'Guardar plan'}
          </button>
        </div>
      </Card>
    </div>
  );
}

export default AcademicAssistantPlanner;
