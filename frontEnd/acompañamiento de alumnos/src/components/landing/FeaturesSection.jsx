import styles from "../../styles/landing.module.css";

const features = [
  {
    icon: "📅",
    title: "Gestión Académica",
    description:
      "Planifica tu trayectoria universitaria completa. Visualiza materias, prerrequisitos y organiza tu camino hacia la graduación.",
  },
  {
    icon: "🧠",
    title: "Recomendaciones Inteligentes",
    description:
      "Recibe sugerencias personalizadas de materias basadas en tu desempeño, intereses y objetivos académicos.",
  },
  {
    icon: "👥",
    title: "Estudio Colaborativo",
    description:
      "Crea y únete a sesiones de estudio con compañeros. Comparte conocimientos y aprende en comunidad.",
  },
  {
    icon: "📁",
    title: "Materiales Compartidos",
    description:
      "Accede a una biblioteca colaborativa de apuntes, ejercicios y recursos creados por la comunidad estudiantil.",
  },
];

const FeaturesSection = () => {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.sectionHeading}>
        <h2>
          Todo lo que necesitas para <span>triunfar</span>
        </h2>
        <p>Herramientas diseñadas para estudiantes universitarios modernos</p>
      </div>

      <div className={styles.featuresGrid}>
        {features.map((feature) => (
          <article className={styles.featureCard} key={feature.title}>
            <div className={styles.featureCard__icon}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;