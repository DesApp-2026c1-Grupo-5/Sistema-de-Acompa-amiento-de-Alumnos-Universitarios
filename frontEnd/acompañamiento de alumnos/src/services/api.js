const BASE = "/api";

const buildHeaders = (extra = {}) => {
  const token = localStorage.getItem("siva_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const request = async (path, { method = "GET", body, headers } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* respuesta sin body */
  }

  if (!res.ok) {
    const err = new Error(data?.message || "Error de red");
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }

  return data;
};

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
