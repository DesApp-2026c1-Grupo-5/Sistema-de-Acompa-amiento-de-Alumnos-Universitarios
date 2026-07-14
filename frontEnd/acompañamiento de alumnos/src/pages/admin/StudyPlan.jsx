/**
 * Endpoints disponibles:
 * - GET /api/planes-estudio/:id - Obtener plan por ID con sus materias
 * - POST /api/carreras/:carreraId/planes - Crear nuevo plan (opcional con materias)
 * - PATCH /api/planes-estudio/:id - Actualizar estado del plan
 * - PUT /api/planes-estudio/:id - Actualizar plan completo (conditions + subjects)
 * - POST /api/planes-estudio/:planId/materias - Agregar materia al plan
 * - PUT /api/planes-estudio/:planId/materias/:materiaId - Actualizar materia
 * - DELETE /api/planes-estudio/:planId/materias/:materiaId - Eliminar materia
 * 
 * Estructura de datos esperada:
 * - studyPlan: { id, careerId, careerName, planYear, status, conditions: {...}, subjects: [...] }
 * - conditions: { englishRequired, englishCertification, electiveCredits, electiveLabel, unahurSubjects, unahurLabel }
 * - subject: { code, name, year, semester, type, correlatives: [{ codigo, tipo }], credits }
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, FilePen, Trash2, BookOpen, X, Check, ChevronDown } from 'lucide-react';
import PageTitle from '../../components/common/PageTitle';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { getPlanEstudio, savePlanEstudio, addMateriaAlPlan, deleteMateriaDelPlan } from '../../services/planEstudioService';
import { mapPlanEstudioFromApi, mapPlanEstudioToApi } from './careers/mapPlanEstudio';
import styles from './StudyPlan.module.css';

function CorrelativasEditor({ value = [], options = [], onChange }) {
  const toggle = (codigo) => {
    const selected = value.some((correlativa) => correlativa.codigo === codigo);
    onChange(
      selected
        ? value.filter((correlativa) => correlativa.codigo !== codigo)
        : [...value, { codigo, tipo: 'cursar' }]
    );
  };

  const changeType = (codigo, tipo) => {
    onChange(
      value.map((correlativa) =>
        correlativa.codigo === codigo ? { ...correlativa, tipo } : correlativa
      )
    );
  };

  if (options.length === 0) {
    return <span className={styles.correlativeEmpty}>No hay otras materias disponibles.</span>;
  }

  return (
    <div className={styles.correlativeEditor}>
      {options.map((option) => {
        const correlativa = value.find((item) => item.codigo === option.code);
        return (
          <div key={option.code} className={styles.correlativeOption}>
            <label className={styles.correlativeCheck}>
              <input
                type="checkbox"
                checked={Boolean(correlativa)}
                onChange={() => toggle(option.code)}
              />
              <span title={option.name}>{option.code}</span>
            </label>
            {correlativa && (
              <select
                className={styles.correlativeTypeSelect}
                value={correlativa.tipo}
                onChange={(event) => changeType(option.code, event.target.value)}
                aria-label={`Tipo de correlativa ${option.code}`}
              >
                <option value="cursar">Para cursar</option>
                <option value="aprobar">Para aprobar</option>
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StudyPlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPlanId = location.state?.planId;
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(initialPlanId));
  const [loadError, setLoadError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCode, setExpandedCode] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubjects, setEditedSubjects] = useState(null);
  const [editedConditions, setEditedConditions] = useState(null);
  const [editedStatus, setEditedStatus] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [newSubject, setNewSubject] = useState({
    code: '',
    name: '',
    year: 1,
    semester: 'Cuatrimestral',
    type: 'Obligatoria',
    correlatives: [],
    credits: 0
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    codigo: '',
    nombre: '',
    anio_cursada: 1,
    modalidad: 'Cuatrimestral',
    es_optativa: false,
    es_unahur: false,
    creditos_otorga: 0,
    correlativas: [],
  });
  const [addingSubject, setAddingSubject] = useState(false);
  const [addError, setAddError] = useState(null);

  const state = location.state || {};
  const { planId } = state;

  useEffect(() => {
    if (!planId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await getPlanEstudio(planId);
        if (cancelled) return;
        const mapped = mapPlanEstudioFromApi(res.data);
        setStudyPlan({ ...mapped, subjects: [...mapped.subjects] });
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err.message || 'No pudimos cargar el plan de estudios.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [planId]);

  const handleStartEdit = () => {
    setEditedSubjects(
      studyPlan.subjects.map((s) => ({
        ...s,
        correlatives: s.correlatives.map((correlativa) => ({ ...correlativa })),
      }))
    );
    setEditedConditions({ ...studyPlan.conditions });
    setEditedStatus(studyPlan.status);
    setIsEditing(true);
  };

  const handleSaveAll = () => {
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = mapPlanEstudioToApi({
        ...studyPlan,
        conditions: editedConditions,
        status: editedStatus,
        subjects: editedSubjects,
      });
      await savePlanEstudio(studyPlan.id, payload);
      const res = await getPlanEstudio(studyPlan.id);
      const mapped = mapPlanEstudioFromApi(res.data);
      setStudyPlan({ ...mapped, subjects: [...mapped.subjects] });
      setEditedSubjects(null);
      setEditedConditions(null);
      setEditedStatus('');
      setIsEditing(false);
      setShowSaveModal(false);
    } catch (err) {
      setSaveError(err.message || 'No pudimos guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardAll = () => {
    setShowDiscardModal(true);
  };

  const confirmDiscard = () => {
    setEditedSubjects(null);
    setEditedConditions(null);
    setEditedStatus('');
    setIsEditing(false);
    setShowDiscardModal(false);
    setNewSubject({
      code: '',
      name: '',
      year: 1,
      semester: 'Cuatrimestral',
      type: 'Obligatoria',
      correlatives: [],
      credits: 0
    });
  };

  const handleConditionChange = (field, value) => {
    setEditedConditions({ ...editedConditions, [field]: value });
  };

  const handleAddNewSubject = () => {
    if (newSubject.code && newSubject.name) {
      setEditedSubjects([...editedSubjects, newSubject]);
      setNewSubject({
        code: '',
        name: '',
        year: 1,
        semester: 'Cuatrimestral',
        type: 'Obligatoria',
        correlatives: [],
        credits: 0
      });
    }
  };

  const handleNewSubjectChange = (field, value) => {
    setNewSubject({ ...newSubject, [field]: value });
  };

  const handleAddFieldChange = (field, value) => {
    setAddForm((s) => ({ ...s, [field]: value }));
  };

  const handleAddSubject = async () => {
    setAddError(null);
    if (!addForm.codigo.trim() || !addForm.nombre.trim()) {
      setAddError('La materia necesita código y nombre.');
      return;
    }
    setAddingSubject(true);
    try {
      await addMateriaAlPlan(studyPlan.id, addForm);
      setShowAddModal(false);
      setAddForm({
        codigo: '',
        nombre: '',
        anio_cursada: 1,
        modalidad: 'Cuatrimestral',
        es_optativa: false,
        es_unahur: false,
        creditos_otorga: 0,
        correlativas: [],
      });
      const res = await getPlanEstudio(studyPlan.id);
      const mapped = mapPlanEstudioFromApi(res.data);
      setStudyPlan({ ...mapped, subjects: [...mapped.subjects] });
    } catch (err) {
      setAddError(err.message || 'No pudimos agregar la materia.');
    } finally {
      setAddingSubject(false);
    }
  };

  const handleDeleteSubject = (code) => {
    const subject = (studyPlan?.subjects ?? []).find((s) => s.code === code);
    setSubjectToDelete(subject || { code });
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;
    if (isEditing && editedSubjects) {
      const updated = editedSubjects
        .filter((s) => s.code !== subjectToDelete.code)
        .map((s) => ({
          ...s,
          correlatives: s.correlatives.filter(
            (correlativa) => correlativa.codigo !== subjectToDelete.code
          ),
        }));
      setEditedSubjects(updated);
      setSubjectToDelete(null);
      return;
    }
    if (!studyPlan) { setSubjectToDelete(null); return; }
    setDeletingSubject(true);
    try {
      await deleteMateriaDelPlan(studyPlan.id, subjectToDelete.id);
      const res = await getPlanEstudio(studyPlan.id);
      const mapped = mapPlanEstudioFromApi(res.data);
      setStudyPlan({ ...mapped, subjects: [...mapped.subjects] });
    } catch {
      // error silently ignored, modal closes
    } finally {
      setDeletingSubject(false);
      setSubjectToDelete(null);
    }
  };

  const cancelDeleteSubject = () => {
    setSubjectToDelete(null);
  };

  const handleEditedFieldChange = (code, field, value) => {
    setEditedSubjects(
      editedSubjects.map((subject) => {
        if (subject.code === code) return { ...subject, [field]: value };
        if (field !== 'code') return subject;
        return {
          ...subject,
          correlatives: subject.correlatives.map((correlativa) =>
            correlativa.codigo === code ? { ...correlativa, codigo: value } : correlativa
          ),
        };
      })
    );
  };

  const handleEditedCorrelativesChange = (code, correlatives) => {
    setEditedSubjects(
      editedSubjects.map((s) => (s.code === code ? { ...s, correlatives } : s))
    );
  };

  const subjectsToFilter = isEditing && editedSubjects ? editedSubjects : studyPlan?.subjects || [];

  const filteredSubjects = subjectsToFilter
    .filter(subject => {
      const matchesYear = selectedYear === 0 || subject.year === selectedYear;
      const matchesSearch = searchTerm === '' ||
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesYear && matchesSearch;
    })
    .sort((a, b) => (a.year - b.year) || a.code.localeCompare(b.code, undefined, { numeric: true }));

  const getTypeBadgeClass = (type) => {
    return type === 'Obligatoria' ? styles.typeBadgeMandatory : styles.typeBadgeOptional;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Vigente': return styles.statusVigente;
      case 'Transición': return styles.statusTransicion;
      case 'Discontinuado': return styles.statusDiscontinuado;
      default: return styles.statusVigente;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.welcomeCard}>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.container}>
        <PageTitle
          title="Plan de Estudios"
          description="Gestión de planes de estudio y materias"
        />
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeIcon}>
            <BookOpen size={32} color="var(--text-muted)" />
          </div>
          <h2 className={styles.welcomeTitle}>No pudimos cargar el plan</h2>
          <p className={styles.welcomeText}>{loadError}</p>
          <Button variant="gradient" onClick={() => navigate('/admin/careers')}>
            Volver a Carreras
          </Button>
        </div>
      </div>
    );
  }

  if (!studyPlan) {
    return (
      <div className={styles.container}>
        <PageTitle
          title="Plan de Estudios"
          description="Gestión de planes de estudio y materias"
        />
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeIcon}>
            <BookOpen size={32} color="var(--text-muted)" />
          </div>
          <h2 className={styles.welcomeTitle}>Selecciona una carrera</h2>
          <p className={styles.welcomeText}>
            Ve a la sección de Carreras y selecciona "Ver plan activo" o "Editar" para gestionar el plan de estudios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{studyPlan.careerName} — Plan {studyPlan.planYear}</h1>
          {isEditing ? (
            <select
              className={styles.statusSelect}
              value={editedStatus}
              onChange={(e) => setEditedStatus(e.target.value)}
            >
              <option value="Vigente">Vigente</option>
              <option value="Transición">Transición</option>
              <option value="Discontinuado">Discontinuado</option>
            </select>
          ) : (
            <span className={`${styles.badge} ${getStatusBadgeClass(studyPlan.status)}`}>
              {studyPlan.status}
            </span>
          )}
        </div>
        {studyPlan && !isEditing && (
          <div className={styles.headerActions}>
            <Button variant="outlineSoft" iconLeft={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
              Agregar materia
            </Button>
          </div>
        )}
      </div>

      <div className={styles.editActions}>
        {isEditing ? (
          <>
            <Button variant="outlineSoft" iconLeft={<X size={16} />} onClick={handleDiscardAll}>
              Descartar
            </Button>
            <Button variant="gradient" iconLeft={<Check size={16} />} onClick={handleSaveAll}>
              Guardar
            </Button>
          </>
        ) : (
          <Button variant="outlineSoft" iconLeft={<FilePen size={16} />} onClick={handleStartEdit}>
            Editar plan
          </Button>
        )}
      </div>

      <div className={styles.conditionsCard}>
        <div className={styles.conditionsHeader}>
          <h2 className={styles.conditionsTitle}>Condiciones del plan</h2>
        </div>
        <div className={styles.conditionsGrid}>
          <div className={styles.conditionItem}>
            <p className={styles.conditionLabel}>Inglés requerido</p>
            {isEditing ? (
              <input
                type="number"
                min="0"
                className={styles.editInput}
                value={editedConditions?.englishLevel ?? 0}
                onChange={(e) => handleConditionChange('englishLevel', parseInt(e.target.value) || 0)}
              />
            ) : (
              <>
                <p className={styles.conditionValue}>{studyPlan.conditions.englishRequired}</p>
                <p className={styles.conditionHint}>{studyPlan.conditions.englishCertification}</p>
              </>
            )}
          </div>
          <div className={styles.conditionItem}>
            <p className={styles.conditionLabel}>Créditos optativos</p>
            {isEditing ? (
              <input
                type="number"
                className={styles.editInput}
                value={editedConditions?.electiveCredits || 0}
                onChange={(e) => handleConditionChange('electiveCredits', parseInt(e.target.value) || 0)}
              />
            ) : (
              <>
                <p className={styles.conditionValue}>{studyPlan.conditions.electiveCredits} créditos</p>
                <p className={styles.conditionHint}>{studyPlan.conditions.electiveLabel}</p>
              </>
            )}
          </div>
          <div className={styles.conditionItem}>
            <p className={styles.conditionLabel}>Materias UNAHUR</p>
            {isEditing ? (
              <input
                type="number"
                className={styles.editInput}
                value={editedConditions?.unahurSubjects || 0}
                onChange={(e) => handleConditionChange('unahurSubjects', parseInt(e.target.value) || 0)}
              />
            ) : (
              <>
                <p className={styles.conditionValue}>{studyPlan.conditions.unahurSubjects} materias</p>
                <p className={styles.conditionHint}>{studyPlan.conditions.unahurLabel}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterButtons}>
          <Button 
            variant={selectedYear === 0 ? 'gradient' : 'outline'}
            size="sm"
            onClick={() => setSelectedYear(0)}
          >
            Todos
          </Button>
          {[1, 2, 3, 4, 5].map(year => (
            <Button 
              key={year}
              variant={selectedYear === year ? 'gradient' : 'outline'}
              size="sm"
              onClick={() => setSelectedYear(year)}
            >
              {year}° Año
            </Button>
          ))}
        </div>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={16} />
          <input
            type="text"
            placeholder="Buscar materia..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={`${styles.table}${isEditing ? ' ' + styles.editingTable : ''}`}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Materia</th>
                <th>Año</th>
                <th>Modalidad</th>
                <th>Tipo</th>
                <th>Correlativas</th>
                <th>Créditos</th>
                {isEditing && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {isEditing && (
                <tr className={styles.newSubjectRow}>
                  <td className={styles.codeCell} data-label="Código">
                    <input
                      type="text"
                      className={styles.editInput}
                      placeholder="Código"
                      value={newSubject.code}
                      onChange={(e) => handleNewSubjectChange('code', e.target.value)}
                    />
                  </td>
                  <td className={styles.nameCell} data-label="Materia">
                    <input
                      type="text"
                      className={styles.editInput}
                      placeholder="Nombre"
                      value={newSubject.name}
                      onChange={(e) => handleNewSubjectChange('name', e.target.value)}
                    />
                  </td>
                  <td className={styles.yearCell} data-label="Año">
                    <select
                      className={styles.editSelect}
                      value={newSubject.year}
                      onChange={(e) => handleNewSubjectChange('year', parseInt(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map(y => (
                        <option key={y} value={y}>{y}°</option>
                      ))}
                    </select>
                  </td>
                  <td className={styles.modalityCell} data-label="Modalidad">
                    <select
                      className={styles.editSelect}
                      value={newSubject.semester}
                      onChange={(e) => handleNewSubjectChange('semester', e.target.value)}
                    >
                      <option value="Cuatrimestral">Cuatrimestral</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </td>
                  <td className={styles.typeCell} data-label="Tipo">
                    <select
                      className={styles.editSelect}
                      value={newSubject.type}
                      onChange={(e) => handleNewSubjectChange('type', e.target.value)}
                    >
                      <option value="Obligatoria">Obligatoria</option>
                      <option value="Optativa">Optativa</option>
                    </select>
                  </td>
                  <td className={styles.correlativesCell} data-label="Correlativas">
                    <CorrelativasEditor
                      value={newSubject.correlatives}
                      options={editedSubjects ?? []}
                      onChange={(correlatives) =>
                        handleNewSubjectChange('correlatives', correlatives)
                      }
                    />
                  </td>
                  <td className={styles.creditsCell} data-label="Créditos">
                    <input
                      type="number"
                      className={styles.editInput}
                      placeholder="0"
                      value={newSubject.credits}
                      onChange={(e) => handleNewSubjectChange('credits', parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td className={styles.actionsCell} data-label="Acciones">
                    <Button
                      variant="iconSquare"
                      title="Agregar"
                      iconLeft={<Plus size={16} />}
                      onClick={handleAddNewSubject}
                    />
                  </td>
                </tr>
              )}
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map(subject => {
                  const displaySubject = isEditing && editedSubjects 
                    ? editedSubjects.find(s => s.code === subject.code) 
                    : subject;
                  
                  return (
                    <tr key={subject.code} className={expandedCode === subject.code ? styles.expanded : ''}>
                      <td className={styles.codeCell} data-label="Código">
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.editInput}
                            value={displaySubject.code}
                            onChange={(e) => handleEditedFieldChange(subject.code, 'code', e.target.value)}
                          />
                        ) : (
                          <span className={styles.code}>{subject.code}</span>
                        )}
                        <button
                          type="button"
                          className={styles.chevron}
                          aria-label="Mostrar detalles"
                          onClick={() => setExpandedCode(expandedCode === subject.code ? null : subject.code)}
                        >
                          <ChevronDown size={18} />
                        </button>
                      </td>
                      <td className={styles.nameCell} data-label="Materia">
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.editInput}
                            value={displaySubject.name}
                            onChange={(e) => handleEditedFieldChange(subject.code, 'name', e.target.value)}
                          />
                        ) : (
                          <span className={styles.subjectName}>{subject.name}</span>
                        )}
                      </td>
                      <td className={styles.yearCell} data-label="Año">
                        {isEditing ? (
                          <select
                            className={styles.editSelect}
                            value={displaySubject.year}
                            onChange={(e) => handleEditedFieldChange(subject.code, 'year', parseInt(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5].map(y => (
                              <option key={y} value={y}>{y}°</option>
                            ))}
                          </select>
                        ) : (
                          <span className={styles.year}>{subject.year}°</span>
                        )}
                      </td>
                      <td className={styles.modalityCell} data-label="Modalidad">
                        {isEditing ? (
                          <select
                            className={styles.editSelect}
                            value={displaySubject.semester}
                            onChange={(e) => handleEditedFieldChange(subject.code, 'semester', e.target.value)}
                          >
                            <option value="Cuatrimestral">Cuatrimestral</option>
                            <option value="Anual">Anual</option>
                          </select>
                        ) : (
                          <span className={styles.semesterBadge}>{subject.semester}</span>
                        )}
                      </td>
                      <td className={styles.typeCell} data-label="Tipo">
                        {isEditing ? (
                          <select
                            className={styles.editSelect}
                            value={displaySubject.type}
                            onChange={(e) => handleEditedFieldChange(subject.code, 'type', e.target.value)}
                          >
                            <option value="Obligatoria">Obligatoria</option>
                            <option value="Optativa">Optativa</option>
                          </select>
                        ) : (
                          <span className={`${styles.typeBadge} ${getTypeBadgeClass(subject.type)}`}>
                            {subject.type}
                          </span>
                        )}
                      </td>
                      <td className={styles.correlativesCell} data-label="Correlativas">
                        {isEditing ? (
                          <CorrelativasEditor
                            value={displaySubject.correlatives}
                            options={editedSubjects.filter(
                              (candidate) => candidate.code !== displaySubject.code
                            )}
                            onChange={(correlatives) =>
                              handleEditedCorrelativesChange(subject.code, correlatives)
                            }
                          />
                        ) : (
                          <div className={styles.correlatives}>
                            {subject.correlatives.length > 0 ? (
                              subject.correlatives.map(corr => (
                                <span
                                  key={`${corr.codigo}-${corr.tipo}`}
                                  className={styles.correlativeTag}
                                >
                                  {corr.codigo}
                                  <small>
                                    {corr.tipo === 'aprobar' ? 'Para aprobar' : 'Para cursar'}
                                  </small>
                                </span>
                              ))
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className={styles.creditsCell} data-label="Créditos">
                        {isEditing ? (
                          <input
                            type="number"
                            className={styles.editInput}
                            value={displaySubject.credits}
                            onChange={(e) => handleEditedFieldChange(subject.code, 'credits', parseInt(e.target.value) || 0)}
                          />
                        ) : (
                          <span className={styles.credits}>{subject.credits}</span>
                        )}
                      </td>
                      {isEditing && (
                        <td className={styles.actionsCell} data-label="Acciones">
                          <div className={styles.actions}>
                            <Button 
                              variant="iconSquareDanger" 
                              title="Eliminar" 
                              iconLeft={<Trash2 size={16} />}
                              onClick={() => handleDeleteSubject(subject.code)}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isEditing ? 8 : 7} className={styles.emptyState}>
                    No se encontraron materias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={subjectToDelete !== null}
        title="Eliminar materia"
        onClose={cancelDeleteSubject}
        size="sm"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="outline" onClick={cancelDeleteSubject} disabled={deletingSubject}>
              Cancelar
            </Button>
            <Button variant="dangerSolid" onClick={confirmDeleteSubject} disabled={deletingSubject}>
              {deletingSubject ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </div>
        }
      >
        <p>¿Estás seguro de que deseas eliminar esta materia del plan de estudios?</p>
      </Modal>

      <Modal
        open={showSaveModal}
        title="Guardar cambios"
        onClose={() => !saving && setShowSaveModal(false)}
        size="sm"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="outline" onClick={() => setShowSaveModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={confirmSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        }
      >
        <p>¿Estás seguro de que deseas guardar los cambios realizados en el plan de estudios?</p>
        {saveError && <p className={styles.deleteWarning}>{saveError}</p>}
      </Modal>

      <Modal
        open={showDiscardModal}
        title="Descartar cambios"
        onClose={() => setShowDiscardModal(false)}
        size="sm"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="outline" onClick={() => setShowDiscardModal(false)}>
              Cancelar
            </Button>
            <Button variant="dangerSolid" onClick={confirmDiscard}>
              Descartar
            </Button>
          </div>
        }
      >
        <p>¿Estás seguro de que deseas descartar todos los cambios realizados?</p>
        <p className={styles.deleteWarning}>
          Esta acción no se puede deshacer.
        </p>
      </Modal>

      <Modal
        open={showAddModal}
        title="Agregar materia al plan"
        onClose={() => { setShowAddModal(false); setAddError(null); }}
        size="md"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="outline" onClick={() => { setShowAddModal(false); setAddError(null); }}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleAddSubject} disabled={addingSubject}>
              {addingSubject ? 'Agregando…' : 'Agregar'}
            </Button>
          </div>
        }
      >
        <div className={styles.modalForm}>
          <div className={styles.modalGrid}>
            <label className={styles.modalField}>
              <span>Código *</span>
              <input
                className={styles.editInput}
                value={addForm.codigo}
                onChange={(e) => handleAddFieldChange('codigo', e.target.value)}
                placeholder="INF101"
              />
            </label>
            <label className={styles.modalField}>
              <span>Nombre *</span>
              <input
                className={styles.editInput}
                value={addForm.nombre}
                onChange={(e) => handleAddFieldChange('nombre', e.target.value)}
                placeholder="Matemática I"
              />
            </label>
            <label className={styles.modalField}>
              <span>Año de cursada</span>
              <select
                className={styles.editSelect}
                value={addForm.anio_cursada}
                onChange={(e) => handleAddFieldChange('anio_cursada', Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}°</option>
                ))}
              </select>
            </label>
            <label className={styles.modalField}>
              <span>Modalidad</span>
              <select
                className={styles.editSelect}
                value={addForm.modalidad}
                onChange={(e) => handleAddFieldChange('modalidad', e.target.value)}
              >
                <option value="Cuatrimestral">Cuatrimestral</option>
                <option value="Anual">Anual</option>
              </select>
            </label>
            <label className={styles.modalField}>
              <span>Créditos que otorga</span>
              <input
                type="number"
                min={0}
                className={styles.editInput}
                value={addForm.creditos_otorga}
                onChange={(e) => handleAddFieldChange('creditos_otorga', Number(e.target.value))}
              />
            </label>
            <div className={styles.modalCheckboxes}>
              <label className={styles.modalCheckbox}>
                <input
                  type="checkbox"
                  checked={addForm.es_optativa}
                  onChange={(e) => handleAddFieldChange('es_optativa', e.target.checked)}
                />
                Optativa
              </label>
              <label className={styles.modalCheckbox}>
                <input
                  type="checkbox"
                  checked={addForm.es_unahur}
                  onChange={(e) => handleAddFieldChange('es_unahur', e.target.checked)}
                />
                UNAHUR
              </label>
            </div>
          </div>

          {studyPlan?.subjects?.length > 0 && (
            <div className={styles.modalField}>
              <span>Correlativas (materias ya existentes en el plan)</span>
              <CorrelativasEditor
                value={addForm.correlativas}
                options={studyPlan.subjects}
                onChange={(correlativas) => handleAddFieldChange('correlativas', correlativas)}
              />
            </div>
          )}

          {addError && <p className={styles.modalError}>{addError}</p>}
        </div>
      </Modal>
    </div>
  );
}

export default StudyPlan;
