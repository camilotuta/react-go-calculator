package api

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"calculadora-api/internal/calculator"
)

func TestMain(m *testing.M) {
	// Se apagan los logs del middleware para que no ensucien la salida de los tests
	log.SetOutput(io.Discard)
	os.Exit(m.Run())
}

// doRequest manda una petición al router completo y devuelve la respuesta grabada.
func doRequest(t *testing.T, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()

	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	NewRouter("*").ServeHTTP(rec, req)
	return rec
}

func TestOperationsOK(t *testing.T) {
	tests := []struct {
		path string
		body string
		want float64
	}{
		{"/api/add", `{"a": 2, "b": 3}`, 5},
		{"/api/subtract", `{"a": 10, "b": 4.5}`, 5.5},
		{"/api/multiply", `{"a": -3, "b": 4}`, -12},
		{"/api/divide", `{"a": 9, "b": 2}`, 4.5},
		{"/api/power", `{"a": 2, "b": 8}`, 256},
		{"/api/sqrt", `{"a": 81}`, 9},
		{"/api/percentage", `{"a": 20, "b": 150}`, 30},
	}

	for _, tt := range tests {
		t.Run(tt.path, func(t *testing.T) {
			rec := doRequest(t, http.MethodPost, tt.path, tt.body)

			if rec.Code != http.StatusOK {
				t.Fatalf("status = %d, se esperaba 200 (body: %s)", rec.Code, rec.Body)
			}
			if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
				t.Errorf("Content-Type = %q, se esperaba application/json", ct)
			}

			var resp calcResponse
			if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
				t.Fatalf("la respuesta no es un JSON válido: %v", err)
			}
			if resp.Result != tt.want {
				t.Errorf("result = %v, se esperaba %v", resp.Result, tt.want)
			}
		})
	}
}

func TestResponseBody(t *testing.T) {
	tests := []struct {
		name string
		path string
		body string
		want string
	}{
		{
			name: "devuelve la operación, los operandos y el resultado",
			path: "/api/divide",
			body: `{"a": 10, "b": 4}`,
			want: `{"operation":"divide","a":10,"b":4,"result":2.5}`,
		},
		{
			name: "la raíz cuadrada ignora b",
			path: "/api/sqrt",
			body: `{"a": 16, "b": 99}`,
			want: `{"operation":"sqrt","a":16,"result":4}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := doRequest(t, http.MethodPost, tt.path, tt.body)

			if got := strings.TrimSpace(rec.Body.String()); got != tt.want {
				t.Errorf("body = %s, se esperaba %s", got, tt.want)
			}
		})
	}
}

func TestOperationErrors(t *testing.T) {
	invalidJSON := `el body debe ser un JSON válido, por ejemplo {"a": 1, "b": 2}`

	tests := []struct {
		name       string
		path       string
		body       string
		wantStatus int
		wantError  string
	}{
		// errores matemáticos -> 422
		{"división entre cero", "/api/divide", `{"a": 5, "b": 0}`, 422, calculator.ErrDivisionByZero.Error()},
		{"raíz de un negativo", "/api/sqrt", `{"a": -4}`, 422, calculator.ErrNegativeSqrt.Error()},
		{"resultado demasiado grande", "/api/power", `{"a": 10, "b": 999}`, 422, calculator.ErrOutOfRange.Error()},
		{"resultado no real", "/api/power", `{"a": -8, "b": 0.5}`, 422, calculator.ErrNotRealNumber.Error()},

		// errores en los datos de entrada -> 400
		{"falta b", "/api/add", `{"a": 1}`, 400, "falta el campo 'b'"},
		{"falta a", "/api/sqrt", `{}`, 400, "falta el campo 'a'"},
		{"a en null", "/api/multiply", `{"a": null, "b": 2}`, 400, "falta el campo 'a'"},
		{"texto en vez de número", "/api/add", `{"a": "dos", "b": 3}`, 400, "el campo 'a' debe ser un número válido"},
		{"booleano en vez de número", "/api/subtract", `{"a": 1, "b": true}`, 400, "el campo 'b' debe ser un número válido"},
		{"número fuera del rango de float64", "/api/add", `{"a": 1e999, "b": 3}`, 400, "el campo 'a' debe ser un número válido"},
		{"JSON mal formado", "/api/add", `{"a": 1, "b":`, 400, invalidJSON},
		{"body vacío", "/api/add", ``, 400, invalidJSON},
		{"body que no es un objeto", "/api/add", `[1, 2]`, 400, invalidJSON},
		{"body demasiado grande", "/api/add", `{"a": 1, "b": 2, "x": "` + strings.Repeat("x", 2000) + `"}`, 400, "el body es demasiado grande"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := doRequest(t, http.MethodPost, tt.path, tt.body)

			if rec.Code != tt.wantStatus {
				t.Errorf("status = %d, se esperaba %d", rec.Code, tt.wantStatus)
			}

			var resp errorResponse
			if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
				t.Fatalf("el error no viene en JSON: %v (body: %s)", err, rec.Body)
			}
			if resp.Error != tt.wantError {
				t.Errorf("error = %q, se esperaba %q", resp.Error, tt.wantError)
			}
		})
	}
}

func TestRoutes(t *testing.T) {
	tests := []struct {
		name       string
		method     string
		path       string
		wantStatus int
	}{
		{"health check", http.MethodGet, "/api/health", http.StatusOK},
		{"método incorrecto", http.MethodGet, "/api/add", http.StatusMethodNotAllowed},
		{"operación que no existe", http.MethodPost, "/api/modulo", http.StatusNotFound},
		{"preflight de CORS", http.MethodOptions, "/api/add", http.StatusNoContent},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := doRequest(t, tt.method, tt.path, "")

			if rec.Code != tt.wantStatus {
				t.Errorf("status = %d, se esperaba %d", rec.Code, tt.wantStatus)
			}
		})
	}
}

func TestHealthBody(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/api/health", "")

	if got := strings.TrimSpace(rec.Body.String()); got != `{"status":"ok"}` {
		t.Errorf("body = %s", got)
	}
}
