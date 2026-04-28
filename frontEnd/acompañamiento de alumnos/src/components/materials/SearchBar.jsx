import { useEffect, useRef, useState } from 'react';
import { Search, Filter, Check } from 'lucide-react';
import styles from './SearchBar.module.css';
import { TYPE_OPTIONS } from '../../pages/student/materials/mockData';

const FILTER_OPTIONS = [{ value: 'all', label: 'Todos los tipos' }, ...TYPE_OPTIONS];

function SearchBar({
  query,
  onQueryChange,
  typeFilter = 'all',
  onTypeFilterChange,
  placeholder = 'Buscar por nombre, materia o tags...',
}) {
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const activeCount = typeFilter !== 'all' ? 1 : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchField}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          className={styles.input}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Buscar materiales"
        />
      </div>

      <div className={styles.filterWrap} ref={popRef}>
        <button
          type="button"
          className={`${styles.filterBtn} ${activeCount ? styles.filterBtnActive : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <Filter size={16} />
          <span>Filtros</span>
          {activeCount > 0 && <span className={styles.count}>{activeCount}</span>}
        </button>

        {open && (
          <div className={styles.popover} role="listbox" aria-label="Filtrar por tipo">
            <p className={styles.popoverTitle}>Filtrar por tipo</p>
            <ul className={styles.popoverList}>
              {FILTER_OPTIONS.map((o) => {
                const selected = o.value === typeFilter;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      className={`${styles.popoverItem} ${selected ? styles.popoverItemSelected : ''}`}
                      onClick={() => {
                        onTypeFilterChange(o.value);
                        setOpen(false);
                      }}
                      role="option"
                      aria-selected={selected}
                    >
                      <span>{o.label}</span>
                      {selected && <Check size={16} />}
                    </button>
                  </li>
                );
              })}
            </ul>
            {typeFilter !== 'all' && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => {
                  onTypeFilterChange('all');
                  setOpen(false);
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
