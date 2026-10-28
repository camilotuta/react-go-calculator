package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"calculadora-api/internal/api"
)

func main() {
	port := getEnv("PORT", "8080")
	allowedOrigin := getEnv("CORS_ORIGIN", "*")

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           api.NewRouter(allowedOrigin),
		ReadHeaderTimeout: 5 * time.Second,
	}

	// Se escucha Ctrl+C y SIGTERM (lo que manda docker stop) para apagar
	// el servidor sin cortar las peticiones que estén en curso.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Printf("API escuchando en http://localhost:%s", port)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("no se pudo iniciar el servidor: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("apagando el servidor...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("error al apagar el servidor: %v", err)
	}
}

// getEnv lee una variable de entorno y si no está definida usa el valor por defecto.
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
