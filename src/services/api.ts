import { API_BASE_URL, STORE_STORAGE, type ApiErrorPayload } from '../types/api'

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = typeof window !== 'undefined' ? localStorage.getItem(STORE_STORAGE.token) : null
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !isFormData(options.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(STORE_STORAGE.token)
      localStorage.removeItem(STORE_STORAGE.user)
    }
    throw new Error((data as ApiErrorPayload | null)?.message || 'Erro na requisição')
  }
  return data as T
}

function bodyFor(data: unknown) {
  return data === undefined || isFormData(data) ? data : JSON.stringify(data)
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = unknown>(endpoint: string, data?: unknown, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: bodyFor(data) }),
  put: <T = unknown>(endpoint: string, data?: unknown, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: bodyFor(data) }),
  delete: <T = unknown>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
}

export default api
