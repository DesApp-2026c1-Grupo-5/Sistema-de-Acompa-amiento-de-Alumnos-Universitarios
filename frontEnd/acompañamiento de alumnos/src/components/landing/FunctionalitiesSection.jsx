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
    <section className="functionalities-section">
      <div className="section-heading">
        <h2>
          Funcionalidades <span>potentes</span>
        </h2>
        <p>Descubre las herramientas que transformarán tu experiencia universitaria</p>
      </div>

      <div className="functionalities-grid">
        {functionalities.map((item) => (
          <article className="functionality-card" key={item.title}>
            <div className="functionality-card__header">
              <div className="functionality-card__icon">{item.icon}</div>

              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>

            <div className={`functionality-mock functionality-mock--${item.type}`}>
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
        <div className="mock-line mock-line--primary"></div>
        <div className="mock-line"></div>
        <div className="mock-line mock-line--short"></div>
      </>
    );
  }

  if (type === "calendar") {
    return (
      <div className="calendar-mock">
        {Array.from({ length: 21 }).map((_, index) => (
          <span
            key={index}
            className={index === 10 || index === 11 || index === 15 ? "active" : ""}
          ></span>
        ))}
      </div>
    );
  }

  if (type === "feed") {
    return (
      <>
        <div className="feed-row">
          <span className="avatar active"></span>
          <div>
            <div className="mock-line"></div>
            <div className="mock-line mock-line--short"></div>
          </div>
        </div>

        <div className="feed-row">
          <span className="avatar"></span>
          <div>
            <div className="mock-line"></div>
            <div className="mock-line mock-line--short"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="materials-mock">
      <span className="active"></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default FunctionalitiesSection;