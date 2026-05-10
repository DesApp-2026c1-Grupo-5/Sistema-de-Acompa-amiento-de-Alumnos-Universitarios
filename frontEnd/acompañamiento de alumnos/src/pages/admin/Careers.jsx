import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import PageTitle from '../../components/common/PageTitle';
import CareerCard from '../../components/admin/CareerCard';
import styles from './Careers.module.css';

const careersData = [
  {
    id: 1,
    name: 'Ingeniería en Sistemas',
    faculty: 'Facultad de Ingeniería',
    title: 'Ingeniero en Sistemas de Información',
    duration: '5 años',
    plans: [
      { year: 2023, status: 'Vigente' },
      { year: 2020, status: 'Transicion' },
      { year: 2015, status: 'Discontinuado' },
    ],
  },
  {
    id: 2,
    name: 'Licenciatura en Administración',
    faculty: 'Facultad de Ciencias Económicas',
    title: 'Licenciado en Administración',
    duration: '4 años',
    plans: [
      { year: 2022, status: 'Vigente' },
      { year: 2018, status: 'Transicion' },
    ],
  },
  {
    id: 3,
    name: 'Medicina',
    faculty: 'Facultad de Medicina',
    title: 'Médico',
    duration: '6 años',
    plans: [
      { year: 2021, status: 'Vigente' },
      { year: 2016, status: 'Discontinuado' },
    ],
  },
  {
    id: 4,
    name: 'Derecho',
    faculty: 'Facultad de Derecho',
    title: 'Abogado',
    duration: '5 años',
    plans: [
      { year: 2023, status: 'Vigente' },
      { year: 2019, status: 'Transicion' },
    ],
  },
  {
    id: 5,
    name: 'Arquitectura',
    faculty: 'Facultad de Arquitectura',
    title: 'Arquitecto',
    duration: '5 años',
    plans: [{ year: 2022, status: 'Vigente' }],
  },
];

function Careers() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCareers = careersData.filter((career) =>
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
