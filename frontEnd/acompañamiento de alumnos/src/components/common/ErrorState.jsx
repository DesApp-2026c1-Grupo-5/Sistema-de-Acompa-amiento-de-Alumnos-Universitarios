import styles from './ErrorState.module.css';

function ErrorState({
  title = 'Ocurrió un error',
  description = 'No se pudo completar la acción.',
  action,
}) {
  return (
    <div className={styles.errorState}>
      <div className={styles.icon}>!</div>

      <div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        {action && <div className={styles.action}>{action}</div>}
      </div>
    </div>
  );
}

export default ErrorState;

/*
Ejemplo de uso:

<ErrorState
  title="No se pudieron cargar los materiales"
  description="Intentá nuevamente más tarde."
  action={<Button variant="outline">Reintentar</Button>}
/>
*/