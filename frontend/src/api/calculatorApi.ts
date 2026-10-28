import type { Operation } from '../operations'

// En desarrollo (proxy de Vite) y en Docker (nginx) las llamadas van a /api en
// el mismo origen. VITE_API_URL sirve por si el backend está en otra URL.
const API_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Lo que puede venir en el body: el resultado si salió bien o el error si no
interface ApiResponse {
  result?: number
  error?: string
}

export async function calculate(operation: Operation, a: number, b?: number): Promise<number> {
  const body = b === undefined ? { a } : { a, b }

  let response: Response
  try {
    response = await fetch(`${API_URL}/api/${operation}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    // fetch solo falla así cuando no hay conexión con el servidor
    throw new ApiError('No se pudo conectar con el servidor. Revisa que el backend esté corriendo.')
  }

  // Si la respuesta no es JSON (por ejemplo un 502 del proxy) data queda en null
  const data: ApiResponse | null = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error ?? `El servidor respondió con un error (${response.status})`
    throw new ApiError(message, response.status)
  }

  const result = data?.result
  if (typeof result !== 'number') {
    throw new ApiError('La respuesta del servidor no tiene el formato esperado')
  }
  return result
}
