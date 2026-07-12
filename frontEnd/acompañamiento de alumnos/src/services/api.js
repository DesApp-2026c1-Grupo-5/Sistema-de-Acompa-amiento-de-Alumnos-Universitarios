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

const getDownloadFilename = (contentDisposition) => {
  if (!contentDisposition) return null;

  const encoded = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded.replace(/^"|"$/g, ""));
    } catch {
      return encoded.replace(/^"|"$/g, "");
    }
  }

  return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1] ?? null;
};

const download = async (path) => {
  const res = await fetch(`${BASE}${path}`, { headers: buildHeaders({}, false) });

  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch {
      /* respuesta de error sin JSON */
    }
    const err = new Error(data?.message || "No pudimos descargar el archivo.");
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }

  return {
    blob: await res.blob(),
    filename: getDownloadFilename(res.headers.get("Content-Disposition")),
  };
};

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
  postFormData: (path, formData) => request(path, { method: "POST", body: formData, includeJson: false }),
  download,
};
