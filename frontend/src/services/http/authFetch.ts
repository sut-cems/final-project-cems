export function getAuthToken(): string | null {
  return localStorage.getItem("authToken") || localStorage.getItem("token");
}

export async function authFetch(input: string | URL, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(init.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
