import { Inbox } from 'lucide-react';
import MaterialCard from './MaterialCard';
import styles from './MaterialGrid.module.css';

function MaterialGrid({
  materials,
  onView,
  onDownload,
  onJoinDiscord,
  downloadingMaterialId,
}) {
  if (!materials || materials.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <Inbox size={32} />
        </div>
        <h3 className={styles.emptyTitle}>No se encontraron materiales</h3>
        <p className={styles.emptyText}>
          Probá ajustando la búsqueda o los filtros.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {materials.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          onView={onView}
          onDownload={onDownload}
          onJoinDiscord={onJoinDiscord}
          isDownloading={downloadingMaterialId === material.id}
        />
      ))}
    </div>
  );
}

export default MaterialGrid;
