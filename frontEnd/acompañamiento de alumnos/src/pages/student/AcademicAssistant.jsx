import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
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
  const [simulatorSubjects, setSimulatorSubjects] = useState(
    academicData.simulator.subjects
  );

  const toggleSubject = (id) => {
    setSimulatorSubjects(prev =>
      prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s)
    );
  };

  const handleSimulate = () => {
    console.log('Simulating:', simulatorSubjects.filter(s => s.checked).map(s => s.name));
  };

  return (
    <div className={styles.container}>
      <AcademicAssistantHeader />

      <AcademicAssistantStats stats={academicData.stats} />

      <AcademicAssistantSubjects subjects={academicData.subjects} />

      <AcademicAssistantFinals finals={academicData.finals} />

      <AcademicAssistantYears years={academicData.years} />

      <AcademicAssistantSimulator
        subjects={simulatorSubjects}
        onToggle={toggleSubject}
        onSimulate={handleSimulate}
      />

      <AcademicAssistantPlanner />

      <AcademicAssistantRecommendations />
    </div>
  );
}

export default AcademicAssistant;