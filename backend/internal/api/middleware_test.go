package api

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCORSHeaders(t *testing.T) {
	handler := cors("http://localhost:5173", http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/api/add", nil))

	if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:5173" {
		t.Errorf("Access-Control-Allow-Origin = %q", got)
	}
	if got := rec.Header().Get("Access-Control-Allow-Headers"); got != "Content-Type" {
		t.Errorf("Access-Control-Allow-Headers = %q", got)
	}
}

func TestCORSPreflightDoesNotCallNext(t *testing.T) {
	called := false
	handler := cors("*", http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		called = true
	}))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodOptions, "/api/add", nil))

	if called {
		t.Error("el preflight no debería llegar al handler")
	}
	if rec.Code != http.StatusNoContent {
		t.Errorf("status = %d, se esperaba 204", rec.Code)
	}
}

func TestLogRequests(t *testing.T) {
	var buf bytes.Buffer
	log.SetOutput(&buf)
	defer log.SetOutput(io.Discard)

	handler := logRequests(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusTeapot)
	}))
	handler.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/api/test", nil))

	if !strings.Contains(buf.String(), "POST /api/test 418") {
		t.Errorf("el log no tiene el formato esperado: %q", buf.String())
	}
}
