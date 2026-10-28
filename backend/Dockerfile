# Etapa 1: compilar el binario
FROM golang:1.27-alpine AS build
WORKDIR /src

COPY . .
# CGO_ENABLED=0 para que el binario sea estático y corra en cualquier imagen
RUN CGO_ENABLED=0 go build -o /bin/calculadora-api ./cmd/server

# Etapa 2: imagen final, solo con el binario
FROM alpine:3.22
COPY --from=build /bin/calculadora-api /usr/local/bin/calculadora-api

USER nobody
EXPOSE 8080
CMD ["calculadora-api"]
