import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import styles from "../../styles/login.module.css";

const MOCK_USERS = [
  {
    email: "estudiante@siva.com",
    password: "123456",
    role: "student",
    redirectTo: "/student/home",
  },
  {
    email: "admin@siva.com",
    password: "admin123",
    role: "admin",
    redirectTo: "/admin/home",
  },
];

const Login = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");

  const handleLoginChange = (field, value) => {
    setLoginData({
      ...loginData,
      [field]: value,
    });

    setLoginError("");
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();

    const foundUser = MOCK_USERS.find(
      (user) =>
        user.email === loginData.email.trim() &&
        user.password === loginData.password
    );

    if (!foundUser) {
      setLoginError("Email o contraseña incorrectos.");
      return;
    }

    localStorage.setItem(
      "sivaUser",
      JSON.stringify({
        email: foundUser.email,
        role: foundUser.role,
      })
    );

    navigate(foundUser.redirectTo);
  };

  return (
    <section className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.authLeft__content}>
          <div className={styles.authLogo}>S</div>

          <h1>Bienvenido a SIVA UNAHUR</h1>

          <p>
            Planificá tu carrera, conectate con estudiantes y alcanzá tus
            objetivos académicos.
          </p>

          <div className={styles.authBenefits}>
            <div className={styles.authBenefit}>
              <span>✓</span>
              <p>Planificador académico inteligente</p>
            </div>

            <div className={styles.authBenefit}>
              <span>✓</span>
              <p>Sesiones de estudio colaborativas</p>
            </div>

            <div className={styles.authBenefit}>
              <span>✓</span>
              <p>Repositorio de materiales académicos</p>
            </div>
          </div>

          <div className={styles.authDemoUsers}>
            <p><strong>Usuario estudiante:</strong> estudiante@siva.com / 123456</p>
            <p><strong>Usuario admin:</strong> admin@siva.com / admin123</p>
          </div>
        </div>
      </div>

      <div className={styles.authRight}>
        <Link to="/" className={styles.authBack}>
          ← Volver
        </Link>

        <div className={styles.authFormWrapper}>
          <div className={styles.authTabs}>
            <button
              type="button"
              className={activeTab === "login" ? styles.active : ""}
              onClick={() => setActiveTab("login")}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className={activeTab === "register" ? styles.active : ""}
              onClick={() => setActiveTab("register")}
            >
              Registrarse
            </button>
          </div>

          {activeTab === "login" ? (
            <form className={styles.authForm} onSubmit={handleLoginSubmit}>
              <div className={styles.authField}>
                <label>Email</label>

                <div className={styles.authInput}>
                  <span>✉</span>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={loginData.email}
                    onChange={(e) =>
                      handleLoginChange("email", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.authField}>
                <label>Contraseña</label>

                <div className={styles.authInput}>
                  <span>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) =>
                      handleLoginChange("password", e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className={styles.authPasswordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {loginError && <p className={styles.authError}>{loginError}</p>}

              <button type="submit" className={styles.authSubmit}>
                Iniciar sesión
              </button>
            </form>
          ) : (
            <form className={styles.authForm}>
              <div className={styles.authField}>
                <label>Nombre completo</label>
                <div className={styles.authInput}>
                  <span>👤</span>
                  <input type="text" placeholder="Juan Pérez" />
                </div>
              </div>

              <div className={styles.authField}>
                <label>Email</label>
                <div className={styles.authInput}>
                  <span>✉</span>
                  <input type="email" placeholder="tu@email.com" />
                </div>
              </div>

              <div className={styles.authField}>
                <label>Contraseña</label>
                <div className={styles.authInput}>
                  <span>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    className={styles.authPasswordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <Button variant="primary" size="lg" fullWidth>
                Crear cuenta
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Login;