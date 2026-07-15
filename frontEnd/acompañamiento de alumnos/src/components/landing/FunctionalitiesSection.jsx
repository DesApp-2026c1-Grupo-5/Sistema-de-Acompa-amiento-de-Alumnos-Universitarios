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
    icon: "🧩",
    title: "Simulador de cursada",
    description:
      "Simula los distintos escenarios para poder visualizar cómo podés continuar con tu cursada.",
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
    icon: "📝",
    title: "Planificador de cursada",
    description:
      "Podés planificar cómo será tu carrera en base a la cantidad de horas de cada materia y a tu predisposición horaria.",
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
      <>
        <div className={styles.mockLinePrimary}></div>
        <div className={styles.mockLine}></div>
        <div className={`${styles.mockLine} ${styles.mockLineShort}`}></div>

        <div className={styles.feedRow}>
          <span className={`${styles.avatar} ${styles.active}`}></span>
          <div>
            <div className={styles.mockLine}></div>
            <div className={`${styles.mockLine} ${styles.mockLineShort}`}></div>
          </div>
        </div>
      </>
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
    <div className={styles.calendarMock}>
      {Array.from({ length: 28 }).map((_, index) => (
        <span
          key={index}
          className={
            index === 3 ||
              index === 4 ||
              index === 10 ||
              index === 16 ||
              index === 17 ||
              index === 24
              ? styles.active
              : ""
          }
        />
      ))}
    </div>
  );
};

export default FunctionalitiesSection;