// Arma una respuesta falsa de fetch con lo mínimo que usa el cliente de la API.
// Si body es undefined, json() falla como cuando el servidor no devuelve JSON.
export function fakeResponse(status: number, body?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new SyntaxError('no es JSON')) : Promise.resolve(body)),
  } as Response
}
