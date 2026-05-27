import AcademicAssistantHeader from '../../components/academicAssistant/AcademicAssistantHeader';
import AcademicAssistantStats from '../../components/academicAssistant/AcademicAssistantStats';
import AcademicAssistantSubjects from '../../components/academicAssistant/AcademicAssistantSubjects';
import AcademicAssistantFinals from '../../components/academicAssistant/AcademicAssistantFinals';
import AcademicAssistantYears from '../../components/academicAssistant/AcademicAssistantYears';
import AcademicAssistantSimulator from '../../components/academicAssistant/AcademicAssistantSimulator';
import AcademicAssistantPlanner from '../../components/academicAssistant/AcademicAssistantPlanner';
import AcademicAssistantRecommendations from '../../components/academicAssistant/AcademicAssistantRecommendations';
import styles from './AcademicAssistant.module.css';
import academicData from './academicAssistant/academicAssistantData.json';

function AcademicAssistant() {
  return (
    <div className={styles.container}>
      <AcademicAssistantHeader />

      <AcademicAssistantStats stats={academicData.stats} />

      <AcademicAssistantSubjects subjects={academicData.subjects} />

      <AcademicAssistantFinals finals={academicData.finals} />

      <AcademicAssistantYears years={academicData.years} />

      <AcademicAssistantSimulator
        approvedIds={academicData.studentStatus.approvedIds}
        inProgressIds={academicData.studentStatus.inProgressIds}
      />

      <AcademicAssistantPlanner />

      <AcademicAssistantRecommendations />
    </div>
  );
}

export default AcademicAssistant;