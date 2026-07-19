import assert from "node:assert/strict";
import test from "node:test";
import {
  createField,
  getDefaultAnswers,
  maskDigits,
  normalizeFields,
  setFieldAnswer,
  toggleFieldAnswer,
  validate,
  validateForm,
} from "../dist/model.js";

test("normaliza a ordem dos campos sem alterar a entrada", () => {
  const input = [
    { order: 4, type: "text", label: "Segundo" },
    { order: 2, type: "text", label: "Primeiro" },
  ];
  const normalized = normalizeFields(input);

  assert.deepEqual(
    normalized.map((field) => [field.order, field.label]),
    [
      [1, "Primeiro"],
      [2, "Segundo"],
    ],
  );
  assert.equal(input[0].order, 4);
});

test("cria respostas padrão sem duplicar respostas existentes", () => {
  const field = createField("select", 1);
  field.formularioCampoOpcao[1].selected = true;

  const first = getDefaultAnswers([field], []);
  const second = getDefaultAnswers([field], first);

  assert.equal(first.length, 1);
  assert.equal(first[0].value, "Opção 2");
  assert.deepEqual(second, first);
});

test("substitui respostas simples e alterna respostas múltiplas", () => {
  const text = { id: "name", order: 1, type: "text", label: "Nome" };
  const choices = {
    id: "colors",
    order: 2,
    type: "checkbox-group",
    label: "Cores",
  };

  const updated = setFieldAnswer([], text, "Ana");
  const selected = toggleFieldAnswer(updated, choices, "Azul");
  const removed = toggleFieldAnswer(selected, choices, "Azul");

  assert.equal(updated[0].fieldId, "name");
  assert.equal(selected.length, 2);
  assert.deepEqual(removed, updated);
});

test("valida obrigatórios e mantém o retorno legado", () => {
  const field = {
    order: 1,
    type: "text",
    label: "Nome",
    required: true,
  };

  assert.equal(validateForm([], [field]).length, 1);
  assert.equal(validate([], [field])?.[0].field, "Nome");
  assert.equal(validate([{ label: "Nome", value: "Ana" }], [field]), undefined);
});

test("aplica máscaras de CPF, CNPJ e CEP sem dependências", () => {
  assert.equal(maskDigits("12345678901", "cpf"), "123.456.789-01");
  assert.equal(maskDigits("12345678000199", "cnpj"), "12.345.678/0001-99");
  assert.equal(maskDigits("12345678", "cep"), "12345-678");
});
