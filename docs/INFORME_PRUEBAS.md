# Informe de pruebas y cobertura

Corrida del 27/10/2026 en Windows 11, con Go 1.27.3 y Node 24.13.1.

## Resumen

| Capa | Tests | Fallidos | Cobertura |
|---|---|---|---|
| Backend (Go) | 69 casos (12 funciones de test con sus subtests) | 0 | 100 % en `calculator`, 98,5 % en `api`, 84,6 % en total |
| Frontend (React) | 68 tests en 8 archivos | 0 | 100 % de líneas, ramas y funciones |

## Backend

Comandos, dentro de `backend/`:

```bash
go test ./... -v -coverprofile=coverage.out
go tool cover -func=coverage.out
go tool cover -html=coverage.out -o coverage.html
```

Cobertura por paquete:

| Paquete | Cobertura | Qué falta |
|---|---|---|
| `internal/calculator` | 100 % | nada |
| `internal/api` | 98,5 % | la rama que loguea si falla el `Encode` de la respuesta |
| `cmd/server` | 16,7 % | `main()` |
| Total | 84,6 % | |

El total baja por `main()`. Esa función solo arma el servidor, escucha Ctrl+C / SIGTERM y hace el apagado ordenado, así que en vez de un unit test la probé levantando el servidor a mano. La rama de `writeJSON` que falta solo se ejecuta si se corta la conexión justo mientras se escribe la respuesta, y no me pareció que valiera la pena simularlo.

Detalle por función (salida de `go tool cover -func`):

```
calculadora-api/cmd/server/main.go:16:              main                0.0%
calculadora-api/cmd/server/main.go:49:              getEnv              100.0%
calculadora-api/internal/api/handlers.go:36:        binaryHandler       100.0%
calculadora-api/internal/api/handlers.go:49:        unaryHandler        100.0%
calculadora-api/internal/api/handlers.go:63:        readRequest         100.0%
calculadora-api/internal/api/handlers.go:85:        decodeErrorMessage  100.0%
calculadora-api/internal/api/handlers.go:100:       respond             100.0%
calculadora-api/internal/api/handlers.go:116:       health              100.0%
calculadora-api/internal/api/handlers.go:120:       writeJSON           75.0%
calculadora-api/internal/api/handlers.go:128:       writeError          100.0%
calculadora-api/internal/api/middleware.go:11:      cors                100.0%
calculadora-api/internal/api/middleware.go:32:      WriteHeader         100.0%
calculadora-api/internal/api/middleware.go:38:      logRequests         100.0%
calculadora-api/internal/api/router.go:12:          NewRouter           100.0%
calculadora-api/internal/calculator/calculator.go:20:  Add               100.0%
calculadora-api/internal/calculator/calculator.go:25:  Subtract          100.0%
calculadora-api/internal/calculator/calculator.go:30:  Multiply          100.0%
calculadora-api/internal/calculator/calculator.go:35:  Divide            100.0%
calculadora-api/internal/calculator/calculator.go:43:  Power             100.0%
calculadora-api/internal/calculator/calculator.go:52:  Sqrt              100.0%
calculadora-api/internal/calculator/calculator.go:60:  Percentage        100.0%
calculadora-api/internal/calculator/calculator.go:67:  checkResult       100.0%
total:                                                 (statements)      84.6%
```

Qué prueba cada archivo:

- `calculator_test.go`: las 7 operaciones en tablas, con casos normales y de borde. Negativos, decimales, división entre cero (y 0/0), 0 elevado a un negativo, base negativa con exponente decimal (da NaN), overflow a infinito, y que nunca se devuelva -0.
- `handlers_test.go`: los endpoints con `httptest` contra el router completo. Respuesta 200 de cada operación, el JSON exacto que se devuelve, errores 422 (matemáticos) y 400 (falta un campo, viene `null`, texto o booleano en vez de número, número fuera de rango, JSON roto, body vacío o demasiado grande). También 404, 405, el health check y el preflight de CORS.
- `middleware_test.go`: headers de CORS, que el preflight no llegue al handler y el formato de la línea de log.
- `main_test.go`: `getEnv` con y sin la variable definida.

Reporte HTML: [coverage/backend.html](coverage/backend.html)

## Frontend

Comando, dentro de `frontend/`:

```bash
npm run coverage
```

Los tests usan Vitest con jsdom y Testing Library, y la cobertura sale de V8. `main.tsx` y los propios archivos de test no cuentan.

| Archivo | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| `App.tsx` | 100 | 100 | 100 | 100 |
| `operations.ts` | 100 | 100 | 100 | 100 |
| `api/calculatorApi.ts` | 100 | 100 | 100 | 100 |
| `components/CalculatorForm.tsx` | 100 | 100 | 100 | 100 |
| `components/History.tsx` | 100 | 100 | 100 | 100 |
| `components/ResultDisplay.tsx` | 100 | 100 | 100 | 100 |
| `hooks/useCalculator.ts` | 100 | 100 | 100 | 100 |
| `utils/numbers.ts` | 100 | 100 | 100 | 100 |
| Total | 100 (94/94) | 100 (76/76) | 100 (26/26) | 100 (89/89) |

Qué prueba cada archivo:

- `utils/numbers.test.ts`: qué acepta y qué rechaza el parseo (punto o coma, negativos, espacios, notación científica, texto) y el formateo (0.1 + 0.2 se muestra como 0.3, -0 como 0).
- `operations.test.ts`: cómo se arma el texto de cada operación ("12 ÷ 4", "√16", "20% de 150") y que la raíz sea la única operación de un solo número.
- `api/calculatorApi.test.ts`: con `fetch` simulado. Que llame al endpoint correcto con el body correcto, que use el mensaje de error del backend, qué pasa sin conexión, los 502/503/504 del proxy y una respuesta que no trae `result`.
- `hooks/useCalculator.test.ts`: los estados de la pantalla (cargando, resultado, error), el historial con máximo 10 entradas y las funciones para limpiar.
- `components/CalculatorForm.test.tsx`: el formulario usado como lo usaría una persona (con `user-event`). Validaciones, Enter para calcular, la raíz cuadrada que desactiva B, el botón Limpiar y el botón desactivado mientras carga.
- `components/ResultDisplay.test.tsx` y `components/History.test.tsx`: lo que muestra cada uno según el estado.
- `App.test.tsx`: integración de todo junto, simulando solo `fetch`.

Reporte HTML: [coverage/frontend/index.html](coverage/frontend/index.html)

## Pruebas manuales

Además de los tests levanté el backend y el frontend y probé en el navegador:

| Prueba | Resultado |
|---|---|
| 12 ÷ 4 | 3, y queda en el historial |
| 20 % de 150 | 30 |
| √2 | 1.41421356237, con el campo B desactivado |
| 12,5 % de 80 (con coma) | 10 |
| 0.1 + 0.2 | se muestra 0.3 (la API devuelve 0.30000000000000004) |
| 5 ÷ 0 | "No se puede dividir entre cero" y no se agrega al historial |
| "hola" en A y B vacío | error en los dos campos y no se llama a la API |
| Vista de celular (375 px) | una sola columna, con el historial abajo |
| Backend apagado | "No se pudo conectar con el servidor. Revisa que el backend esté corriendo." |

Con la última prueba encontré un problema: al principio aparecía "El servidor respondió con un error (502)", porque cuando el backend está apagado el que responde es el proxy de Vite (en Docker sería nginx). Lo cambié para que 502, 503 y 504 se muestren como error de conexión y le agregué tests.

También probé todos los endpoints con curl, incluyendo los casos de error. Los ejemplos están en el README.

Con Docker llegué hasta la mitad: validé el `docker-compose.yml` con `docker compose config` y compilé el backend para Linux con el mismo comando del Dockerfile (sale un binario estático), pero no pude levantar los contenedores porque Docker Desktop no arrancaba su motor en mi máquina.
