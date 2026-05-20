import { useRef, useState } from "react";
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
  const [loginErrorFields, setLoginErrorFields] = useState([]);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const loginErrorTimeout = useRef(null);

  const [registerData, setRegisterData] = useState({
    nombre_completo: "",
    email: "",
    password: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerErrorFields, setRegisterErrorFields] = useState([]);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const registerErrorTimeout = useRef(null);

  const flagLoginFields = (fields) => {
    setLoginErrorFields(fields);
    if (loginErrorTimeout.current) clearTimeout(loginErrorTimeout.current);
    if (fields.length === 0) return;
    loginErrorTimeout.current = setTimeout(
      () => setLoginErrorFields([]),
      3000
    );
  };

  const flagRegisterFields = (fields) => {
    setRegisterErrorFields(fields);
    if (registerErrorTimeout.current) clearTimeout(registerErrorTimeout.current);
    if (fields.length === 0) return;
    registerErrorTimeout.current = setTimeout(
      () => setRegisterErrorFields([]),
      3000
    );
  };

  const handleLoginChange = (field, value) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
    setLoginError("");
    setLoginErrorFields((prev) => prev.filter((f) => f !== field));
  };

  const handleRegisterChange = (field, value) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
    setRegisterError("");
    setRegisterErrorFields((prev) => prev.filter((f) => f !== field));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginError("");

    const email = loginData.email.trim();
    const password = loginData.password;

    const emptyFields = [];
    if (!email) emptyFields.push("email");
    if (!password) emptyFields.push("password");
    if (emptyFields.length > 0) {
      setLoginError("Completá email y contraseña.");
      flagLoginFields(emptyFields);
      return;
    }

    setLoadingLogin(true);
    try {
      const user = await login(email, password);
      navigate(redirectFor(user));
    } catch (err) {
      if (err.status === 401) {
        setLoginError("Email o contraseña incorrectos.");
        flagLoginFields(["email", "password"]);
      } else if (err.status === 400 && err.details?.[0]) {
        setLoginError(err.details[0].message);
        flagLoginFields([err.details[0].field]);
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

    const emptyFields = [];
    if (!nombre_completo) emptyFields.push("nombre_completo");
    if (!email) emptyFields.push("email");
    if (!password) emptyFields.push("password");
    if (emptyFields.length > 0) {
      setRegisterError("Completá todos los campos.");
      flagRegisterFields(emptyFields);
      return;
    }

    setLoadingRegister(true);
    try {
      const user = await register(nombre_completo, email, password);
      navigate(redirectFor(user));
    } catch (err) {
      if (err.status === 409) {
        setRegisterError("Ese email ya está registrado.");
        flagRegisterFields(["email"]);
      } else if (err.status === 400 && err.details?.[0]) {
        setRegisterError(err.details[0].message);
        flagRegisterFields([err.details[0].field]);
      } else {
        setRegisterError(err.message || "No pudimos crear la cuenta, intentá de nuevo.");
      }
    } finally {
      setLoadingRegister(false);
    }
  };

  const inputClass = (fields, field) =>
    fields.includes(field)
      ? `${styles.authInput} ${styles.authInputError}`
      : styles.authInput;

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
            <form className={styles.authForm} onSubmit={handleLoginSubmit} noValidate>
              <div className={styles.authField}>
                <label>Email</label>

                <div className={inputClass(loginErrorFields, "email")}>
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

                <div className={inputClass(loginErrorFields, "password")}>
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
            <form className={styles.authForm} onSubmit={handleRegisterSubmit} noValidate>
              <div className={styles.authField}>
                <label>Nombre completo</label>
                <div className={inputClass(registerErrorFields, "nombre_completo")}>
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
                <div className={inputClass(registerErrorFields, "email")}>
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
                <div className={inputClass(registerErrorFields, "password")}>
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
