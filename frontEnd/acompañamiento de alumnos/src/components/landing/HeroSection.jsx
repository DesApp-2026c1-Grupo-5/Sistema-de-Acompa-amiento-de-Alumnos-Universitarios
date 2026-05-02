const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-section__content">
        <div className="hero-section__text">
          <div className="hero-badge">
            ✨ Plataforma académica inteligente
          </div>

          <h1>
            Planifica tu carrera universitaria con{" "}
            <span>éxito</span>
          </h1>

          <p>
            La plataforma todo-en-uno para estudiantes universitarios.
            Gestiona tus materias, organiza tus estudios y conecta con tu
            comunidad académica.
          </p>
        </div>

        <div className="hero-section__visual">
          <div className="dashboard-preview">
            <div className="dashboard-preview__header">
              <h3>Mi Dashboard</h3>
              <span>Semestre 2026-1</span>
            </div>

            <div className="subject-preview subject-preview--active">
              <div className="subject-preview__top">
                <strong>Cálculo II</strong>
                <span>En curso</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill progress-bar__fill--large"></div>
              </div>
            </div>

            <div className="subject-preview">
              <div className="subject-preview__top">
                <strong>Estructuras de Datos</strong>
                <span>Próximo</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill progress-bar__fill--small"></div>
              </div>
            </div>

            <div className="subject-preview">
              <div className="subject-preview__top">
                <strong>Física Aplicada</strong>
                <span>Próximo</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill progress-bar__fill--tiny"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;