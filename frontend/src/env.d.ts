// Variables de entorno que usa la app (se definen en un archivo .env o al hacer el build)
interface ImportMetaEnv {
  // URL base del backend. Si no se define se usa la misma URL del frontend (/api)
  readonly VITE_API_URL?: string
}
