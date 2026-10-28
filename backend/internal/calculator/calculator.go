// Package calculator tiene la lógica matemática de la calculadora.
// No sabe nada de HTTP, así se puede probar y reutilizar por separado.
package calculator

import (
	"errors"
	"math"
)

// Errores que pueden devolver las operaciones. Se exportan para poder
// compararlos con errors.Is desde los handlers y desde los tests.
var (
	ErrDivisionByZero = errors.New("no se puede dividir entre cero")
	ErrNegativeSqrt   = errors.New("no se puede calcular la raíz cuadrada de un número negativo")
	ErrNotRealNumber  = errors.New("el resultado no es un número real")
	ErrOutOfRange     = errors.New("el resultado es demasiado grande")
)

// Add devuelve a + b.
func Add(a, b float64) (float64, error) {
	return checkResult(a + b)
}

// Subtract devuelve a - b.
func Subtract(a, b float64) (float64, error) {
	return checkResult(a - b)
}

// Multiply devuelve a * b.
func Multiply(a, b float64) (float64, error) {
	return checkResult(a * b)
}

// Divide devuelve a / b. Falla si b es cero.
func Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivisionByZero
	}
	return checkResult(a / b)
}

// Power devuelve a elevado a la b.
func Power(a, b float64) (float64, error) {
	// 0 elevado a un negativo es dividir entre cero (0^-2 = 1/0^2)
	if a == 0 && b < 0 {
		return 0, ErrDivisionByZero
	}
	return checkResult(math.Pow(a, b))
}

// Sqrt devuelve la raíz cuadrada de a. Falla si a es negativo.
func Sqrt(a float64) (float64, error) {
	if a < 0 {
		return 0, ErrNegativeSqrt
	}
	return checkResult(math.Sqrt(a))
}

// Percentage devuelve el a% de b. Por ejemplo Percentage(20, 150) = 30.
func Percentage(a, b float64) (float64, error) {
	return checkResult(a * b / 100)
}

// checkResult revisa que el resultado sea un número finito. Con float64 una
// operación puede terminar en Inf (overflow) o NaN (por ejemplo (-8)^(1/3)
// con math.Pow), y esos valores ni siquiera se pueden mandar en JSON.
func checkResult(result float64) (float64, error) {
	if math.IsNaN(result) {
		return 0, ErrNotRealNumber
	}
	if math.IsInf(result, 0) {
		return 0, ErrOutOfRange
	}
	if result == 0 {
		// evita devolver -0 (pasa con cosas como -5 * 0)
		return 0, nil
	}
	return result, nil
}
