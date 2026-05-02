import styles from './EmptyState.module.css';

function EmptyState({
  title = 'No hay datos para mostrar',
  description,
  action,
}) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>∅</div>

      <h3 className={styles.title}>{title}</h3>

      {description && <p className={styles.description}>{description}</p>}

      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export default EmptyState;

/*
Ejemplo de uso:

<EmptyState
  title="No hay sesiones disponibles"
  description="Cuando tus compañeros creen sesiones, aparecerán acá."
  action={<Button>Crear sesión</Button>}
/>
*/