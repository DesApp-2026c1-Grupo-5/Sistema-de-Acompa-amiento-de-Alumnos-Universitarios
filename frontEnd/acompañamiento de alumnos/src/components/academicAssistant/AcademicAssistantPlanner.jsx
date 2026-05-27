import { useState, useEffect, useRef, useMemo } from 'react';
import { Save, GripVertical, Wand2, Loader2, Plus, Trash2, Pencil, ChevronRight, ChevronDown } from 'lucide-react';
import Card from '../common/Card';
import ErrorState from '../common/ErrorState';
import { getCareerSubjects } from '../../services/plannerService';
import styles from './AcademicAssistantPlanner.module.css';

function AcademicAssistantPlanner() {
  const [hours, setHours] = useState(20);
  const [plan, setPlan] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelDraft, setLabelDraft] = useState('');
  const [expandedCorr, setExpandedCorr] = useState({});
  const dragSource = useRef(null);
  const labelInputRef = useRef(null);

  const subjectNameMap = useMemo(() => {
    const map = {};
    for (const s of allSubjects) map[s.id] = s.name;
    return map;
  }, [allSubjects]);

  function buildDefaultPlan(subjects) {
    const groups = {};
    for (const s of subjects) {
      const key = `${s.year}-${s.cuatrimestre}`;
      if (!groups[key]) {
        groups[key] = {
          year: s.year,
          cuatrimestre: s.cuatrimestre,
          label: `Año ${s.year} - Cuatrimestre ${s.cuatrimestre}`,
          subjects: [],
        };
      }
      groups[key].subjects.push({ id: s.id, name: s.name, hours: s.hours, correlatives: s.correlatives });
    }
    return Object.values(groups).sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.cuatrimestre - b.cuatrimestre
    );
  }

  function nextLabel() {
    let n = 1;
    while (plan.some((g) => g.label === `Cuatrimestre ${n}`)) n++;
    return `Cuatrimestre ${n}`;
  }

  useEffect(() => {
    getCareerSubjects()
      .then((data) => {
        setAllSubjects(data.subjects);
        setPlan(buildDefaultPlan(data.subjects));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = () => {
    const remaining = [...allSubjects];

    const newPlan = [];
    let yearCursor = 1;
    let cuatriCursor = 1;
    let groupHours = 0;

    function ensureGroup() {
      if (
        newPlan.length === 0 ||
        newPlan[newPlan.length - 1].cuatrimestre !== cuatriCursor ||
        newPlan[newPlan.length - 1].year !== yearCursor
      ) {
        newPlan.push({
          year: yearCursor,
          cuatrimestre: cuatriCursor,
          label: `Año ${yearCursor} - Cuatrimestre ${cuatriCursor}`,
          subjects: [],
        });
        groupHours = 0;
      }
    }

    let iterationGuard = 0;
    while (remaining.length > 0 && iterationGuard < 200) {
      iterationGuard++;
      ensureGroup();
      let placed = false;

      for (let i = 0; i < remaining.length; i++) {
        const s = remaining[i];
        const met = s.correlatives.every((cId) => !remaining.some((r) => r.id === cId));

        if (!met) continue;

        if (groupHours + s.hours <= hours) {
          newPlan[newPlan.length - 1].subjects.push({ id: s.id, name: s.name, hours: s.hours, correlatives: s.correlatives });
          groupHours += s.hours;
          remaining.splice(i, 1);
          placed = true;
          break;
        }
      }

      if (!placed) {
        if (cuatriCursor === 1) {
          cuatriCursor = 2;
        } else {
          cuatriCursor = 1;
          yearCursor++;
        }
      }
    }

    setPlan(newPlan);
  };

  const fixedTotalHours = plan.reduce(
    (acc, group) => acc + group.subjects.reduce((s, sub) => s + sub.hours, 0),
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
            Horas disponibles por semana
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className={styles.input}
              min={1}
              max={80}
            />
          </label>

          <button className={styles.generateButton} onClick={handleGenerate}>
            <Wand2 size={20} />
            Reorganizar por año
          </button>
        </div>

        <div className={styles.planHeader}>
          <p className={styles.dragHint}>Arrastrá las materias para reorganizar tu plan</p>
          <button className={styles.saveButton} onClick={() => console.log('Plan guardado:', plan)}>
            <Save size={16} />
            Guardar plan
          </button>
        </div>

        <div className={styles.summary}>
          Total del plan: <strong>{fixedTotalHours}hs</strong> · <strong>{hours}hs</strong> semanales por cuatrimestre
        </div>

        {plan.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay materias en el plan. Hacé clic en "Reorganizar por año" para comenzar.</p>
          </div>
        ) : (
          <div className={styles.groupsContainer}>
            {plan.map((group, groupIndex) => {
              const groupHours = group.subjects.reduce((s, sub) => s + sub.hours, 0);
              const isEmpty = group.subjects.length === 0;

              return (
                <div
                  key={groupIndex}
                  className={`${styles.groupCard} ${isEmpty ? styles.groupCardEmpty : ''}`}
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
                        {groupHours}hs
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

                      return (
                        <div key={subject.id}>
                          <div
                            draggable
                            className={styles.subjectItem}
                            onDragStart={(e) => handleDragStart(e, groupIndex, subjectIndex)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, groupIndex, subjectIndex)}
                            onDragEnd={handleDragEnd}
                          >
                            <GripVertical size={16} className={styles.gripIcon} />
                            <span className={styles.subjectName}>{subject.name}</span>
                            {hasCorr && (
                              <button
                                className={styles.corrButton}
                                onClick={() => toggleCorr(subject.id)}
                                title="Ver correlativas"
                              >
                                Correlativas
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                            )}
                            <span className={styles.subjectHours}>{subject.hours}hs</span>
                          </div>
                          {isExpanded && hasCorr && (
                            <div className={styles.corrDropdown}>
                              <span className={styles.corrLabel}>Correlativas:</span>
                              {subject.correlatives.map((cId) => (
                                <span key={cId} className={styles.corrChip}>
                                  {subjectNameMap[cId] || `ID ${cId}`}
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
      </Card>
    </div>
  );
}

export default AcademicAssistantPlanner;
