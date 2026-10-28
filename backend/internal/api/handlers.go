package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
)

// Tamaño máximo del body. Para mandar dos números sobra con 1 KB.
const maxBodySize = 1024

// calcRequest es el body que reciben todos los endpoints de operaciones.
// Los campos son punteros para poder diferenciar "no lo mandaron" de "mandaron 0".
type calcRequest struct {
	A *float64 `json:"a"`
	B *float64 `json:"b"`
}

type calcResponse struct {
	Operation string   `json:"operation"`
	A         float64  `json:"a"`
	B         *float64 `json:"b,omitempty"`
	Result    float64  `json:"result"`
}

type errorResponse struct {
	Error string `json:"error"`
}

type binaryFunc func(a, b float64) (float64, error)
type unaryFunc func(a float64) (float64, error)

// binaryHandler arma el handler de una operación que usa dos números (a y b).
func binaryHandler(name string, op binaryFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req, ok := readRequest(w, r, true)
		if !ok {
			return
		}
		result, err := op(*req.A, *req.B)
		respond(w, name, req, result, err)
	}
}

// unaryHandler arma el handler de una operación que usa un solo número (a).
// Si en el body viene b simplemente se ignora.
func unaryHandler(name string, op unaryFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req, ok := readRequest(w, r, false)
		if !ok {
			return
		}
		req.B = nil
		result, err := op(*req.A)
		respond(w, name, req, result, err)
	}
}

// readRequest lee el body y valida que vengan los campos necesarios.
// Si algo está mal ya deja escrito el error en la respuesta y devuelve ok = false.
func readRequest(w http.ResponseWriter, r *http.Request, needsB bool) (calcRequest, bool) {
	var req calcRequest

	r.Body = http.MaxBytesReader(w, r.Body, maxBodySize)
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, decodeErrorMessage(err))
		return req, false
	}

	if req.A == nil {
		writeError(w, http.StatusBadRequest, "falta el campo 'a'")
		return req, false
	}
	if needsB && req.B == nil {
		writeError(w, http.StatusBadRequest, "falta el campo 'b'")
		return req, false
	}
	return req, true
}

// decodeErrorMessage traduce los errores del decoder de JSON a un mensaje más
// entendible para quien usa la API.
func decodeErrorMessage(err error) string {
	var typeErr *json.UnmarshalTypeError
	var sizeErr *http.MaxBytesError

	switch {
	case errors.As(err, &sizeErr):
		return "el body es demasiado grande"
	case errors.As(err, &typeErr) && typeErr.Field != "":
		return fmt.Sprintf("el campo '%s' debe ser un número válido", typeErr.Field)
	default:
		return `el body debe ser un JSON válido, por ejemplo {"a": 1, "b": 2}`
	}
}

// respond manda el resultado de la operación, o el error si no se pudo calcular.
func respond(w http.ResponseWriter, name string, req calcRequest, result float64, err error) {
	if err != nil {
		// La petición está bien formada pero la operación no se puede hacer
		// (dividir entre cero, raíz de un negativo, etc.), por eso 422 y no 400.
		writeError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, calcResponse{
		Operation: name,
		A:         *req.A,
		B:         req.B,
		Result:    result,
	})
}

func health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("no se pudo escribir la respuesta: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, errorResponse{Error: message})
}
