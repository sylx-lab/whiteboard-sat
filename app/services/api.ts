import { toast } from 'sonner';

/**
 * The store's one way of talking to `/api`. Cookies ride along automatically on
 * a same-origin fetch, so there is no token to thread through — the session
 * cookie set by `/api/auth/login` is what identifies the caller.
 *
 * Throws on any non-2xx with the server's own message, so callers can surface
 * "That reset link has already been used" rather than "Request failed".
 */
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  try {
    const response = await fetch(`/api${path}`, {
      method,
      ...(body === undefined
        ? {}
        : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data?.error ?? `${method} /api${path} failed (${response.status})`;
      toast.error(message);
      throw new Error(message);
    }
    return data as T;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    const message = 'Network request failed';
    toast.error(message);
    throw new Error(message);
  }
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown = {}) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};
