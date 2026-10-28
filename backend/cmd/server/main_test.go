package main

import "testing"

func TestGetEnv(t *testing.T) {
	t.Setenv("CALC_TEST_VAR", "9090")

	if got := getEnv("CALC_TEST_VAR", "8080"); got != "9090" {
		t.Errorf("getEnv con variable definida = %q, se esperaba 9090", got)
	}
	if got := getEnv("CALC_TEST_NO_EXISTE", "8080"); got != "8080" {
		t.Errorf("getEnv sin variable = %q, se esperaba el valor por defecto", got)
	}
}
