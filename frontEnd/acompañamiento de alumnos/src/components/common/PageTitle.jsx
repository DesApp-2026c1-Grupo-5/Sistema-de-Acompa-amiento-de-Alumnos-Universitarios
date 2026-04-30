import styles from './PageTitle.module.css';

function PageTitle({ title, description, action }) {
  return (
    <div className={styles.pageTitle}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export default PageTitle;

/*
Ejemplo de uso:

<PageTitle
  title="Dashboard Académico"
  description="Resumen de tu situación académica actual."
  action={<Button>Actualizar</Button>}
/>
*/