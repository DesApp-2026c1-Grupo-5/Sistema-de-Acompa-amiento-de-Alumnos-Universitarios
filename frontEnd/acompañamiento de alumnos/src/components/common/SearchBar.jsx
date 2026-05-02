import styles from './SearchBar.module.css';

function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
}) {
  return (
    <div className={styles.searchBar}>
      <span className={styles.icon}>⌕</span>

      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

export default SearchBar;

/*
Ejemplo de uso:

<SearchBar
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Buscar materiales..."
/>
*/