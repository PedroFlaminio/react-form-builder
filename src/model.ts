import { FIELD_TYPES } from "./types.js";
import type { FieldType, FormAnswer, FormError, FormField, FormOption } from "./types.js";

export const FIELD_CATALOG: Record<
  FieldType,
  { label: string; icon: string; placeholder?: string }
> = {
  text: { label: "Campo de texto", icon: "T", placeholder: "Insira um texto..." },
  number: { label: "Número", icon: "#", placeholder: "Insira um número..." },
  date: { label: "Data", icon: "◫" },
  cpf: { label: "CPF", icon: "ID", placeholder: "000.000.000-00" },
  cnpj: { label: "CNPJ", icon: "PJ", placeholder: "00.000.000/0000-00" },
  cep: { label: "CEP", icon: "⌖", placeholder: "00000-000" },
  textarea: { label: "Área de texto", icon: "¶", placeholder: "Insira um texto..." },
  select: { label: "Seleção", icon: "⌄", placeholder: "Selecione..." },
  "radio-group": { label: "Grupo de opções", icon: "◉" },
  "checkbox-group": { label: "Grupo de seleção", icon: "☑" },
};

const optionTypes = new Set<FieldType>(["select", "radio-group", "checkbox-group"]);

export function isFieldType(value: unknown): value is FieldType {
  return typeof value === "string" && (FIELD_TYPES as readonly string[]).includes(value);
}

export function createField(type: FieldType, order: number): FormField {
  const catalog = FIELD_CATALOG[type];
  const field: FormField = {
    type,
    order,
    label: catalog.label,
  };
  if (catalog.placeholder !== undefined) field.placeholder = catalog.placeholder;
  if (optionTypes.has(type)) {
    const count = type === "checkbox-group" ? 1 : 3;
    field.formularioCampoOpcao = Array.from({ length: count }, (_, index) => ({
      order: index + 1,
      value: `Opção ${index + 1}`,
      selected: false,
    }));
  }
  return field;
}

export function normalizeFields(fields: readonly FormField[]): FormField[] {
  return [...fields]
    .sort((left, right) => left.order - right.order)
    .map((field, index) => {
      const normalized: FormField = { ...field, order: index + 1 };
      if (field.formularioCampoOpcao) {
        normalized.formularioCampoOpcao = normalizeOptions(field.formularioCampoOpcao);
      }
      return normalized;
    });
}

export function normalizeOptions(options: readonly FormOption[]): FormOption[] {
  return [...options]
    .sort((left, right) => left.order - right.order)
    .map((option, index) => ({ ...option, order: index + 1 }));
}

export function duplicateField(field: FormField, order: number): FormField {
  const duplicate: FormField = {
    ...field,
    order,
    label: `${field.label} (cópia)`,
  };
  delete duplicate.id;
  if (field.formularioCampoOpcao) {
    duplicate.formularioCampoOpcao = field.formularioCampoOpcao.map((option) => {
      const result = { ...option };
      delete result.id;
      return result;
    });
  }
  return duplicate;
}

function sameField(answer: FormAnswer, field: FormField): boolean {
  return field.id !== undefined && answer.fieldId !== undefined
    ? field.id === answer.fieldId
    : answer.label === field.label;
}

export function answerForField(
  answers: readonly FormAnswer[],
  field: FormField,
): FormAnswer | undefined {
  return answers.find((answer) => sameField(answer, field));
}

export function answersForField(
  answers: readonly FormAnswer[],
  field: FormField,
): FormAnswer[] {
  return answers.filter((answer) => sameField(answer, field));
}

export function createAnswer(field: FormField, value: string): FormAnswer {
  const answer: FormAnswer = {
    label: field.label,
    type: field.type,
    order: field.order,
    value,
    sensitive: field.sensitive ?? false,
  };
  if (field.id !== undefined) answer.fieldId = field.id;
  return answer;
}

export function setFieldAnswer(
  answers: readonly FormAnswer[],
  field: FormField,
  value: string,
): FormAnswer[] {
  return [
    ...answers.filter((answer) => !sameField(answer, field)),
    createAnswer(field, value),
  ];
}

export function toggleFieldAnswer(
  answers: readonly FormAnswer[],
  field: FormField,
  value: string,
): FormAnswer[] {
  const exists = answers.some(
    (answer) => sameField(answer, field) && answer.value === value,
  );
  if (exists) {
    return answers.filter(
      (answer) => !(sameField(answer, field) && answer.value === value),
    );
  }
  return [...answers, createAnswer(field, value)];
}

export function getDefaultAnswers(
  fields: readonly FormField[],
  previous: readonly FormAnswer[] = [],
): FormAnswer[] {
  let answers = [...previous];
  for (const field of normalizeFields(fields)) {
    if (answers.some((answer) => sameField(answer, field))) continue;
    const selected = field.formularioCampoOpcao?.filter((option) => option.selected) ?? [];
    for (const option of selected) {
      answers = [...answers, createAnswer(field, option.value)];
    }
  }
  return answers;
}

/** Nome mantido para facilitar a migração da implementação original. */
export const getDefaultAnswersFromFields = getDefaultAnswers;

export function validateForm(
  answers: readonly FormAnswer[],
  fields: readonly FormField[],
  anonymous = false,
): FormError[] {
  const errors: FormError[] = [];
  for (const field of fields) {
    if (anonymous && field.sensitive) continue;
    const values = answersForField(answers, field);
    if (field.required && !values.some((answer) => answer.value.trim() !== "")) {
      errors.push({
        field: field.label,
        error: `${field.label}: Campo obrigatório.`,
      });
    }
  }
  return errors;
}

/** Retorno `undefined` sem erros, compatível com a função original. */
export function validate(
  answers: readonly FormAnswer[],
  fields: readonly FormField[],
  anonymous = false,
): FormError[] | undefined {
  const errors = validateForm(answers, fields, anonymous);
  return errors.length === 0 ? undefined : errors;
}

export function maskDigits(value: string, type: "cpf" | "cnpj" | "cep"): string {
  const maxDigits = type === "cpf" ? 11 : type === "cnpj" ? 14 : 8;
  const digits = value.replace(/\D/g, "").slice(0, maxDigits);
  if (type === "cep") {
    return digits.replace(/^(\d{5})(\d)/, "$1-$2");
  }
  if (type === "cpf") {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
