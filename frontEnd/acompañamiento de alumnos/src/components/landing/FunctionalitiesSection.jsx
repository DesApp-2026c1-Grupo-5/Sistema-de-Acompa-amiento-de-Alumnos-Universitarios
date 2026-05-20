import styles from "../../styles/landing.module.css";

const functionalities = [
  {
    icon: "▦",
    title: "Dashboard Académico",
    description:
      "Vista completa de tu progreso académico, materias actuales y plan de estudios personalizado.",
    type: "dashboard",
  },
  {
    icon: "◷",
    title: "Sesiones de Estudio",
    description:
      "Organiza y programa sesiones de estudio individuales o grupales con recordatorios inteligentes.",
    type: "calendar",
  },
  {
    icon: "💬",
    title: "Feed Social",
    description:
      "Conéctate con estudiantes de tu carrera, comparte logros y participa en discusiones académicas.",
    type: "feed",
  },
  {
    icon: "📖",
    title: "Biblioteca de Materiales",
    description:
      "Accede y comparte recursos académicos: apuntes, guías, ejercicios y material de estudio.",
    type: "materials",
  },
];

const FunctionalitiesSection = () => {
  return (
    <section className={styles.functionalitiesSection}>
      <div className={styles.sectionHeading}>
        <h2>
          Funcionalidades <span>potentes</span>
        </h2>
        <p>Descubre las herramientas que transformarán tu experiencia universitaria</p>
      </div>

      <div className={styles.functionalitiesGrid}>
        {functionalities.map((item) => (
          <article className={styles.functionalityCard} key={item.title}>
            <div className={styles.functionalityCard__header}>
              <div className={styles.functionalityCard__icon}>{item.icon}</div>

              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>

            <div className={styles.functionalityMock}>
              <MockContent type={item.type} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const MockContent = ({ type }) => {
  if (type === "dashboard") {
    return (
      <>
        <div className={`${styles.mockLine} ${styles.mockLinePrimary}`}></div>
        <div className={styles.mockLine}></div>
        <div className={`${styles.mockLine} ${styles.mockLineShort}`}></div>
      </>
    );
  }

  if (type === "calendar") {
    return (
      <div className={styles.calendarMock}>
        {Array.from({ length: 21 }).map((_, index) => (
          <span
            key={index}
            className={index === 10 || index === 11 || index === 15 ? styles.active : ""}
          ></span>
        ))}
      </div>
    );
  }

  if (type === "feed") {
    return (
      <>
        <div className={styles.feedRow}>
          <span className={`${styles.avatar} ${styles.active}`}></span>
          <div>
            <div className={styles.mockLine}></div>
            <div className={`${styles.mockLine} ${styles.mockLineShort}`}></div>
          </div>
        </div>

        <div className={styles.feedRow}>
          <span className={styles.avatar}></span>
          <div>
            <div className={styles.mockLine}></div>
            <div className={`${styles.mockLine} ${styles.mockLineShort}`}></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={styles.materialsMock}>
      <span className={styles.active}></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default FunctionalitiesSection;