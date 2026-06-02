const BASE = "/api";

const buildHeaders = (extra = {}, includeJson = true) => {
  const token = localStorage.getItem("siva_token");
  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const request = async (path, { method = "GET", body, headers, includeJson = true } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: buildHeaders(headers, includeJson),
    body: body ? (includeJson ? JSON.stringify(body) : body) : undefined,
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
  postFormData: (path, formData) => request(path, { method: "POST", body: formData, includeJson: false }),
};
