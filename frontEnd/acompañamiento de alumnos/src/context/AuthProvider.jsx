import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import * as authService from "../services/authService";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("siva_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("siva_token"));
  const [loading, setLoading] = useState(
    () => !!localStorage.getItem("siva_token")
  );

  useEffect(() => {
    const hasToken = !!localStorage.getItem("siva_token");
    if (!hasToken) return;

    authService
      .me()
      .then((res) => {
        if (res?.user) {
          localStorage.setItem("siva_user", JSON.stringify(res.user));
          setUser(res.user);
        }
      })
      .catch(() => {
        localStorage.removeItem("siva_token");
        localStorage.removeItem("siva_user");
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = (tok, usr) => {
    localStorage.setItem("siva_token", tok);
    localStorage.setItem("siva_user", JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    persist(data.token, data.user);
    return data.user;
  };

  const register = async (nombre_completo, email, password) => {
    const data = await authService.register(nombre_completo, email, password);
    persist(data.token, data.user);
    return data.user;
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...partial } : partial;
      localStorage.setItem("siva_user", JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem("siva_token");
    localStorage.removeItem("siva_user");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
