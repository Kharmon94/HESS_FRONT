const TOKEN_KEY = "hess_auth_token";

/**
 * API origin for JSON requests. In production builds, `VITE_API_URL` must be set at **build time**
 * (e.g. Railway/Vercel env var). If it is missing, requests would go to the SPA host (`/api/...`)
 * and never hit Rails — no server logs and login always fails.
 */
function apiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:3000";
  throw new Error(
    "VITE_API_URL is not set. Rebuild the frontend with VITE_API_URL set to your Rails API origin (no trailing slash), e.g. https://your-api.up.railway.app"
  );
}

/** For support UI only — does not throw when `VITE_API_URL` is missing (production misconfig). */
export function getConfiguredApiBaseForDisplay(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:3000 (default when VITE_API_URL unset)";
  return "not set — rebuild frontend with VITE_API_URL";
}

function assertBrowserCanReachApi(base: string): void {
  if (typeof window === "undefined") return;
  if (window.location.protocol === "https:" && base.startsWith("http://")) {
    throw new Error(
      "Mixed content: this page is HTTPS but VITE_API_URL uses http://. The browser will block the request. Use https:// for your API URL (e.g. your Railway public HTTPS URL)."
    );
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export type ApiUser = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string;
  package: string | null;
  package_price: string | null;
  sessions_remaining: number;
  sessions_completed: number;
  total_sessions_in_package: number;
  all_time_sessions: number;
  member_since: string | null;
  payment_method: string | null;
  billing_address: string | null;
};

export type ApiInquiry = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  message: string;
  interested_package: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
};

export type TrainingSessionApi = {
  id: string;
  client_id: string;
  client_name: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  session_type: string | null;
  notes: string | null;
  status: string;
};

async function request<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const base = apiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers as Record<string, string>),
  };
  const body = init.body;
  if (body && typeof body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const token = init.token !== undefined ? init.token : getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  assertBrowserCanReachApi(base);

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (e) {
    const browserMsg = e instanceof Error ? e.message : "Network error";
    throw new Error(
      `${browserMsg} — could not reach ${url}. ` +
        (import.meta.env.DEV
          ? "Start the Rails API (e.g. bin/rails server on port 3000) or set VITE_API_URL."
          : "Use your API’s public https URL in VITE_API_URL (not a private/internal hostname). On the API, set FRONTEND_ORIGIN to this site’s exact origin (https + host, no path). For www vs apex, list both comma-separated. Redeploy the API after changing CORS.")
    );
  }

  const text = await res.text();
  let data: Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      data = {};
    }
  }

  if (!res.ok) {
    const msg =
      (data.error as string) ||
      (data.errors as string[])?.join(", ") ||
      res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data as T;
}

export const api = {
  signIn(email: string, password: string) {
    return request<{ token: string; user: ApiUser }>("/api/v1/auth/sign_in", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      token: null,
    });
  },

  signUp(payload: Record<string, unknown>) {
    return request<{ token: string; user: ApiUser }>("/api/v1/auth/sign_up", {
      method: "POST",
      body: JSON.stringify(payload),
      token: null,
    });
  },

  me() {
    return request<{ user: ApiUser }>("/api/v1/auth/me", { method: "GET" });
  },

  forgotPassword(email: string) {
    return request<unknown>("/api/v1/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
      token: null,
    });
  },

  resetPassword(payload: {
    reset_password_token: string;
    password: string;
    password_confirmation: string;
  }) {
    return request<{ token: string; user: ApiUser }>("/api/v1/auth/password/reset", {
      method: "PUT",
      body: JSON.stringify(payload),
      token: null,
    });
  },

  updatePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) {
    return request<{ user: ApiUser }>("/api/v1/auth/password", {
      method: "PUT",
      body: JSON.stringify({ user: payload }),
    });
  },

  createInquiry(payload: {
    name?: string;
    email: string;
    phone?: string;
    message: string;
    interested_package?: string;
  }) {
    return request<{ inquiry: ApiInquiry }>("/api/v1/inquiries", {
      method: "POST",
      body: JSON.stringify({ inquiry: payload }),
      token: null,
    });
  },

  listAdminInquiries() {
    return request<{ inquiries: ApiInquiry[] }>("/api/v1/admin/inquiries", { method: "GET" });
  },

  updateAdminInquiry(id: string, payload: { status: string }) {
    return request<{ inquiry: ApiInquiry }>(`/api/v1/admin/inquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ inquiry: payload }),
    });
  },

  listTrainingSessions() {
    return request<{ training_sessions: TrainingSessionApi[] }>("/api/v1/training_sessions", {
      method: "GET",
    });
  },

  createTrainingSession(payload: Record<string, unknown>) {
    return request<{ training_session: TrainingSessionApi }>("/api/v1/training_sessions", {
      method: "POST",
      body: JSON.stringify({ training_session: payload }),
    });
  },

  updateTrainingSession(id: string, payload: Record<string, unknown>) {
    return request<{ training_session: TrainingSessionApi }>(`/api/v1/training_sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ training_session: payload }),
    });
  },

  deleteTrainingSession(id: string) {
    return request<unknown>(`/api/v1/training_sessions/${id}`, { method: "DELETE" });
  },

  listAdminClients() {
    return request<{ clients: ApiUser[] }>("/api/v1/admin/clients", { method: "GET" });
  },

  getAdminClient(id: string) {
    return request<{ client: ApiUser }>(`/api/v1/admin/clients/${id}`, { method: "GET" });
  },

  createAdminClient(payload: Record<string, unknown>) {
    return request<{ client: ApiUser }>("/api/v1/admin/clients", {
      method: "POST",
      body: JSON.stringify({ user: payload }),
    });
  },

  updateAdminClient(id: string, payload: Record<string, unknown>) {
    return request<{ client: ApiUser }>(`/api/v1/admin/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ user: payload }),
    });
  },

  deleteAdminClient(id: string) {
    return request<unknown>(`/api/v1/admin/clients/${id}`, { method: "DELETE" });
  },
};
