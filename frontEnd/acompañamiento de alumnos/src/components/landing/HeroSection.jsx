import styles from "../../styles/landing.module.css";

const HeroSection = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroSection__content}>
        <div className={styles.heroSection__text}>
          <div className={styles.heroBadge}>
            ✨ Sistema de Integrado de Vida Academica
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

        <div className={styles.heroSection__visual}>
          <div className={styles.dashboardPreview}>
            <div className={styles.dashboardPreview__header}>
              <h3>Mi Dashboard</h3>
            </div>

            <div className={`${styles.subjectPreview} ${styles.subjectPreviewActive}`}>
              <div className={styles.subjectPreview__top}>
                <strong>Cálculo II</strong>
                <span>En curso</span>
              </div>
              <div className={styles.progressBar}>
                <div className={`${styles.progressBar__fill} ${styles.progressBar__fillLarge}`}></div>
              </div>
            </div>

            <div className={styles.subjectPreview}>
              <div className={styles.subjectPreview__top}>
                <strong>Estructuras de Datos</strong>
                <span>Próximo</span>
              </div>
              <div className={styles.progressBar}>
                <div className={`${styles.progressBar__fill} ${styles.progressBar__fillSmall}`}></div>
              </div>
            </div>

            <div className={styles.subjectPreview}>
              <div className={styles.subjectPreview__top}>
                <strong>Física Aplicada</strong>
                <span>Próximo</span>
              </div>
              <div className={styles.progressBar}>
                <div className={`${styles.progressBar__fill} ${styles.progressBar__fillTiny}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;