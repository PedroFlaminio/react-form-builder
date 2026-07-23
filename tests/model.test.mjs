import assert from "node:assert/strict";
import test from "node:test";
import {
  createAnswer,
  createField,
  getDefaultAnswers,
  maskCurrency,
  maskDigits,
  maskPhone,
  normalizeFields,
  setFieldAnswer,
  toggleDefaultOption,
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

test("cria a resposta padrão de um campo de texto", () => {
  const field = {
    id: "cidade",
    order: 1,
    type: "text",
    label: "Cidade",
    defaultValue: "São Paulo",
  };

  const defaults = getDefaultAnswers([field]);
  const withPreviousAnswer = getDefaultAnswers(
    [field],
    [createAnswer(field, "Campinas")],
  );

  assert.equal(defaults.length, 1);
  assert.equal(defaults[0].value, "São Paulo");
  assert.equal(withPreviousAnswer[0].value, "Campinas");
});

test("permite remover a opção padrão em campos de seleção única", () => {
  const options = [
    { order: 1, value: "Opção 1", selected: false },
    { order: 2, value: "Opção 2", selected: true },
    { order: 3, value: "Opção 3", selected: false },
  ];

  const withoutDefault = toggleDefaultOption(options, 2, false);
  const withNewDefault = toggleDefaultOption(withoutDefault, 3, false);

  assert.deepEqual(
    withoutDefault.map((option) => option.selected),
    [false, false, false],
  );
  assert.deepEqual(
    withNewDefault.map((option) => option.selected),
    [false, false, true],
  );
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

test("valida o tamanho mínimo de campos de texto preenchidos", () => {
  const field = {
    order: 1,
    type: "text",
    label: "Apelido",
    minlength: 4,
  };

  assert.equal(validateForm([], [field]).length, 0);
  assert.match(
    validateForm([{ label: "Apelido", value: "Ana" }], [field])[0].error,
    /no mínimo 4 caracteres/,
  );
  assert.equal(
    validateForm([{ label: "Apelido", value: "Analu" }], [field]).length,
    0,
  );
});

test("aplica máscaras de CPF, CNPJ e CEP sem dependências", () => {
  assert.equal(maskDigits("12345678901", "cpf"), "123.456.789-01");
  assert.equal(maskDigits("12345678000199", "cnpj"), "12.345.678/0001-99");
  assert.equal(maskDigits("12345678", "cep"), "12345-678");
});

test("aplica máscara de valor monetário", () => {
  assert.equal(maskCurrency("1"), "0,01");
  assert.equal(maskCurrency("1234"), "12,34");
  assert.equal(maskCurrency("R$ 1.234,56"), "1.234,56");
  assert.equal(maskCurrency(""), "");
});

test("aplica máscaras de telefone com dez ou onze dígitos", () => {
  assert.equal(maskPhone("1133334444"), "11 3333-4444");
  assert.equal(maskPhone("11999998888"), "11 99999-8888");
  assert.equal(maskPhone("+55 11 99999-8888"), "11 99999-8888");
  assert.equal(maskPhone("+351 11 99999-8888", "+351"), "11 99999-8888");
  assert.equal(maskPhone("1199999888899"), "11 99999-8888");
});

test("define e preserva prefixos personalizados", () => {
  const currency = createField("currency", 1, { currencyPrefix: "US$" });
  const phone = createField("phone", 2, { phonePrefix: "+351" });

  assert.equal(currency.prefix, "US$");
  assert.equal(phone.prefix, "+351");
  assert.equal(createAnswer(currency, "10,00").prefix, "US$");
});
