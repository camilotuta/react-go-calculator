// Package api expone la calculadora como una API REST.
package api

import (
	"net/http"

	"calculadora-api/internal/calculator"
)

// NewRouter registra todas las rutas de la API.
// allowedOrigin es el origen permitido para CORS ("*" deja pasar a cualquiera).
func NewRouter(allowedOrigin string) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", health)

	mux.HandleFunc("POST /api/add", binaryHandler("add", calculator.Add))
	mux.HandleFunc("POST /api/subtract", binaryHandler("subtract", calculator.Subtract))
	mux.HandleFunc("POST /api/multiply", binaryHandler("multiply", calculator.Multiply))
	mux.HandleFunc("POST /api/divide", binaryHandler("divide", calculator.Divide))
	mux.HandleFunc("POST /api/power", binaryHandler("power", calculator.Power))
	mux.HandleFunc("POST /api/percentage", binaryHandler("percentage", calculator.Percentage))
	mux.HandleFunc("POST /api/sqrt", unaryHandler("sqrt", calculator.Sqrt))

	return logRequests(cors(allowedOrigin, mux))
}
