import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Plus, FilePen, SquarePen, Trash2, BookOpen } from 'lucide-react';
import PageTitle from '../../components/common/PageTitle';
import Button from '../../components/common/Button';
import styles from './StudyPlan.module.css';

function StudyPlan() {
  const location = useLocation();
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const state = location.state || {};
  const { careerId, planYear } = state;

  useEffect(() => {
    fetch('/data/studyPlans.json')
      .then((res) => res.json())
      .then((data) => {
        if (careerId && planYear) {
          const plan = data.find(p => p.careerId === careerId && p.planYear === planYear);
          setStudyPlan(plan || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [careerId, planYear]);

  const filteredSubjects = studyPlan?.subjects?.filter(subject => {
    const matchesYear = selectedYear === 0 || subject.year === selectedYear;
    const matchesSearch = searchTerm === '' || 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesYear && matchesSearch;
  }) || [];

  const getTypeBadgeClass = (type) => {
    return type === 'Obligatoria' ? styles.typeBadgeMandatory : styles.typeBadgeOptional;
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
          <span className={styles.badge}>{studyPlan.status}</span>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outlineSoft" iconLeft={<Plus size={16} />}>
            Nuevo plan
          </Button>
          <Button variant="gradient" iconLeft={<Plus size={16} />}>
            Materia
          </Button>
        </div>
      </div>

      <div className={styles.conditionsCard}>
        <div className={styles.conditionsHeader}>
          <h2 className={styles.conditionsTitle}>Condiciones del plan</h2>
          <Button variant="outlineSoft" iconLeft={<FilePen size={16} />} size="sm">
            Editar condiciones
          </Button>
        </div>
        <div className={styles.conditionsGrid}>
          <div className={styles.conditionItem}>
            <p className={styles.conditionLabel}>Inglés requerido</p>
            <p className={styles.conditionValue}>{studyPlan.conditions.englishRequired}</p>
            <p className={styles.conditionHint}>{studyPlan.conditions.englishCertification}</p>
          </div>
          <div className={styles.conditionItem}>
            <p className={styles.conditionLabel}>Créditos optativos</p>
            <p className={styles.conditionValue}>{studyPlan.conditions.electiveCredits} créditos</p>
            <p className={styles.conditionHint}>{studyPlan.conditions.electiveLabel}</p>
          </div>
          <div className={styles.conditionItem}>
            <p className={styles.conditionLabel}>Materias UNAHUR</p>
            <p className={styles.conditionValue}>{studyPlan.conditions.unahurSubjects} materias</p>
            <p className={styles.conditionHint}>{studyPlan.conditions.unahurLabel}</p>
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
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Materia</th>
                <th>Año</th>
                <th>Modalidad</th>
                <th>Tipo</th>
                <th>Correlativas</th>
                <th>Créditos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map(subject => (
                  <tr key={subject.code}>
                    <td>
                      <span className={styles.code}>{subject.code}</span>
                    </td>
                    <td>
                      <span className={styles.subjectName}>{subject.name}</span>
                    </td>
                    <td>
                      <span className={styles.year}>{subject.year}°</span>
                    </td>
                    <td>
                      <span className={styles.semesterBadge}>{subject.semester}</span>
                    </td>
                    <td>
                      <span className={`${styles.typeBadge} ${getTypeBadgeClass(subject.type)}`}>
                        {subject.type}
                      </span>
                    </td>
                    <td>
                      <div className={styles.correlatives}>
                        {subject.correlatives.length > 0 ? (
                          subject.correlatives.map(corr => (
                            <span key={corr} className={styles.correlativeTag}>{corr}</span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={styles.credits}>{subject.credits}</span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button variant="iconSquare" title="Editar" iconLeft={<SquarePen size={16} />} />
                        <Button variant="iconSquareDanger" title="Eliminar" iconLeft={<Trash2 size={16} />} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.emptyState}>
                    No se encontraron materias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudyPlan;