import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

const buildRange = (page, totalPages) => {
  const pages = [];
  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);

  pages.push(1);
  if (left > 2) pages.push('left-ellipsis');
  for (let i = left; i <= right; i += 1) pages.push(i);
  if (right < totalPages - 1) pages.push('right-ellipsis');
  pages.push(totalPages);

  return pages;
};

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const items = buildRange(page, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Paginación">
      <button
        type="button"
        className={styles.navBtn}
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>

      {items.map((item, idx) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            className={`${styles.pageBtn} ${item === page ? styles.active : ''}`}
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ) : (
          <span key={`${item}-${idx}`} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ),
      )}

      <button
        type="button"
        className={styles.navBtn}
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export default Pagination;
