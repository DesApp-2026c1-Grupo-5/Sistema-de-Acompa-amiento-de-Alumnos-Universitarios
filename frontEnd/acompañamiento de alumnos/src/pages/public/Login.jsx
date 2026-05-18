import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/useAuth";
import styles from "../../styles/login.module.css";

const redirectFor = (user) =>
  user?.tipo === "administrador" ? "/admin/home" : "/student/home";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "register" ? "register" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [registerData, setRegisterData] = useState({
    nombre_completo: "",
    email: "",
    password: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [loadingRegister, setLoadingRegister] = useState(false);

  const handleLoginChange = (field, value) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
    setLoginError("");
  };

  const handleRegisterChange = (field, value) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
    setRegisterError("");
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginError("");

    const email = loginData.email.trim();
    const password = loginData.password;

    if (!email || !password) {
      setLoginError("Completá email y contraseña.");
      return;
    }

    setLoadingLogin(true);
    try {
      const user = await login(email, password);
      navigate(redirectFor(user));
    } catch (err) {
      if (err.status === 401) {
        setLoginError("Email o contraseña incorrectos.");
      } else if (err.status === 400 && err.details?.[0]?.message) {
        setLoginError(err.details[0].message);
      } else {
        setLoginError(err.message || "No pudimos iniciar sesión, intentá de nuevo.");
      }
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegisterError("");

    const nombre_completo = registerData.nombre_completo.trim();
    const email = registerData.email.trim();
    const password = registerData.password;

    if (!nombre_completo || !email || !password) {
      setRegisterError("Completá todos los campos.");
      return;
    }

    setLoadingRegister(true);
    try {
      const user = await register(nombre_completo, email, password);
      navigate(redirectFor(user));
    } catch (err) {
      if (err.status === 409) {
        setRegisterError("Ese email ya está registrado.");
      } else if (err.status === 400 && err.details?.[0]?.message) {
        setRegisterError(err.details[0].message);
      } else {
        setRegisterError(err.message || "No pudimos crear la cuenta, intentá de nuevo.");
      }
    } finally {
      setLoadingRegister(false);
    }
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

              <button
                type="submit"
                className={styles.authSubmit}
                disabled={loadingLogin}
              >
                {loadingLogin ? "Iniciando..." : "Iniciar sesión"}
              </button>
            </form>
          ) : (
            <form className={styles.authForm} onSubmit={handleRegisterSubmit}>
              <div className={styles.authField}>
                <label>Nombre completo</label>
                <div className={styles.authInput}>
                  <span>👤</span>
                  <input
                    type="text"
                    placeholder="Juan Pérez"
                    value={registerData.nombre_completo}
                    onChange={(e) =>
                      handleRegisterChange("nombre_completo", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.authField}>
                <label>Email</label>
                <div className={styles.authInput}>
                  <span>✉</span>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={registerData.email}
                    onChange={(e) =>
                      handleRegisterChange("email", e.target.value)
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
                    value={registerData.password}
                    onChange={(e) =>
                      handleRegisterChange("password", e.target.value)
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

              {registerError && (
                <p className={styles.authError}>{registerError}</p>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                type="submit"
                disabled={loadingRegister}
              >
                {loadingRegister ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Login;
