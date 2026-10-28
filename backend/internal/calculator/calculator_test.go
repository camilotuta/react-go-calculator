package calculator

import (
	"errors"
	"math"
	"testing"
)

func TestBinaryOperations(t *testing.T) {
	tests := []struct {
		name    string
		op      func(a, b float64) (float64, error)
		a, b    float64
		want    float64
		wantErr error
	}{
		{"suma de enteros", Add, 2, 3, 5, nil},
		{"suma con negativos y decimales", Add, -4, 1.5, -2.5, nil},
		{"suma con overflow", Add, math.MaxFloat64, math.MaxFloat64, 0, ErrOutOfRange},
		{"suma con NaN", Add, math.NaN(), 1, 0, ErrNotRealNumber},

		{"resta", Subtract, 10, 4, 6, nil},
		{"resta con resultado negativo", Subtract, 3, 7.5, -4.5, nil},

		{"multiplicación", Multiply, 6, 7, 42, nil},
		{"multiplicación por cero", Multiply, 123.45, 0, 0, nil},
		{"multiplicación con overflow", Multiply, 1e200, 1e200, 0, ErrOutOfRange},

		{"división", Divide, 10, 4, 2.5, nil},
		{"división de negativos", Divide, -9, -3, 3, nil},
		{"división entre cero", Divide, 5, 0, 0, ErrDivisionByZero},
		{"cero entre cero", Divide, 0, 0, 0, ErrDivisionByZero},
		{"división con overflow", Divide, 1e308, 1e-10, 0, ErrOutOfRange},

		{"potencia", Power, 2, 10, 1024, nil},
		{"potencia con exponente cero", Power, 7, 0, 1, nil},
		{"potencia con exponente negativo", Power, 2, -2, 0.25, nil},
		{"potencia con base negativa", Power, -2, 3, -8, nil},
		{"base negativa con exponente decimal", Power, -8, 1.0 / 3, 0, ErrNotRealNumber},
		{"cero elevado a un negativo", Power, 0, -1, 0, ErrDivisionByZero},
		{"potencia con overflow", Power, 10, 400, 0, ErrOutOfRange},

		{"porcentaje", Percentage, 20, 150, 30, nil},
		{"porcentaje con decimales", Percentage, 12.5, 80, 10, nil},
		{"porcentaje mayor a 100", Percentage, 150, 40, 60, nil},
		{"porcentaje negativo", Percentage, -10, 50, -5, nil},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := tt.op(tt.a, tt.b)

			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("error = %v, se esperaba %v", err, tt.wantErr)
			}
			if got != tt.want {
				t.Errorf("resultado = %v, se esperaba %v", got, tt.want)
			}
		})
	}
}

func TestSqrt(t *testing.T) {
	tests := []struct {
		name    string
		a       float64
		want    float64
		wantErr error
	}{
		{"raíz exacta", 16, 4, nil},
		{"raíz de cero", 0, 0, nil},
		{"raíz de un decimal", 2.25, 1.5, nil},
		{"raíz no exacta", 2, math.Sqrt2, nil},
		{"raíz de un negativo", -9, 0, ErrNegativeSqrt},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Sqrt(tt.a)

			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("error = %v, se esperaba %v", err, tt.wantErr)
			}
			if got != tt.want {
				t.Errorf("resultado = %v, se esperaba %v", got, tt.want)
			}
		})
	}
}

func TestResultIsNeverNegativeZero(t *testing.T) {
	got, err := Multiply(-5, 0)
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if math.Signbit(got) {
		t.Errorf("se esperaba 0 y se obtuvo %v", got)
	}
}
