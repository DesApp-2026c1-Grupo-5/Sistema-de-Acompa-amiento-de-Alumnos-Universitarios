import MaterialListItem from './MaterialListItem';

import styles from '../../pages/admin/ModerationPage/ModerationPage.module.css';

function MaterialList({
  materials,
  selectedMaterial,
  onSelect,
}) {
  if (materials.length === 0) {
    return (
      <section className={styles.tableContainer}>
        <div className={styles.emptyState}>
          No se encontraron materiales denunciados.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <span>Material</span>
        <span>Usuario</span>
        <span>Denuncias</span>
        <span>Estado</span>
      </div>

      <div className={styles.tableBody}>
        {materials.map((material) => (
          <MaterialListItem
            key={material.id}
            material={material}
            selectedMaterial={selectedMaterial}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default MaterialList;