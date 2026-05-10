import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import PageTitle from '../../components/common/PageTitle';
import CareerCard from '../../components/admin/CareerCard';
import styles from './Careers.module.css';

function Careers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [careers, setCareers] = useState([]);

  useEffect(() => {
    fetch('/data/careers.json')
      .then((res) => res.json())
      .then((data) => setCareers(data));
  }, []);

  const filteredCareers = careers.filter((career) =>
    career.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <PageTitle
        title="Gestión de Carreras"
        description="Administra carreras, planes de estudio y correlatividades"
      />

      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Buscar carrera..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.grid}>
        {filteredCareers.map((career) => (
          <CareerCard key={career.id} career={career} />
        ))}

        <div className={styles.addCard}>
          <div className={styles.addIconWrapper}>
            <Plus size={32} />
          </div>
          <h3 className={styles.addTitle}>Agregar carrera</h3>
          <p className={styles.addDescription}>Definir nueva carrera universitaria</p>
        </div>
      </div>
    </div>
  );
}

export default Careers;
