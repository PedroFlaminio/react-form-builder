import type { CSSProperties, FormEvent, ReactNode } from "react";

export const FIELD_TYPES = [
  "text",
  "number",
  "currency",
  "phone",
  "date",
  "cpf",
  "cnpj",
  "cep",
  "textarea",
  "select",
  "radio-group",
  "checkbox-group",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

/** Alias compatível com o tipo usado originalmente no Central 156. */
export type TipoType = FieldType;

export interface FormOption {
  id?: string | number | undefined;
  order: number;
  value: string;
  selected?: boolean | undefined;
}

export interface FormField {
  id?: string | number | undefined;
  order: number;
  type: FieldType;
  required?: boolean | undefined;
  sensitive?: boolean | undefined;
  label: string;
  description?: string | undefined;
  placeholder?: string | undefined;
  prefix?: string | undefined;
  max?: number | undefined;
  min?: number | undefined;
  minlength?: number | undefined;
  maxlength?: number | undefined;
  defaultValue?: string | undefined;
  formularioCampoOpcao?: FormOption[] | undefined;
}

/** Alias compatível com o tipo usado originalmente no Central 156. */
export type FormFieldType = FormField;

export interface FormAnswer {
  id?: string | number | undefined;
  fieldId?: string | number | undefined;
  order?: number | undefined;
  label: string;
  value: string;
  type?: FieldType | string | undefined;
  prefix?: string | undefined;
  sensitive?: boolean | undefined;
}

/** Alias compatível com o tipo usado originalmente no Central 156. */
export type Answer = FormAnswer;

export interface FormError {
  field: string;
  error: string;
}

export interface FormDefinition {
  id?: string | number | undefined;
  descricao: string;
  campos: FormField[];
}

/** Alias compatível com o tipo usado originalmente no Central 156. */
export type Formulario = FormDefinition;

export interface FormBuilderProps {
  /** Campos controlados. Use com `onChange`. */
  fields?: FormField[];
  /** Campos iniciais para uso não controlado. */
  defaultFields?: FormField[];
  onChange?: (fields: FormField[]) => void;
  allowedTypes?: readonly FieldType[];
  /** Prefixo inicial dos novos campos monetários. */
  currencyPrefix?: string;
  /** Prefixo inicial dos novos campos de telefone. */
  phonePrefix?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  emptyMessage?: ReactNode;
  "aria-label"?: string;
}

export interface FormRendererProps {
  fields: FormField[];
  /** Respostas controladas. Use com `onChange`. */
  value?: FormAnswer[];
  /** Respostas iniciais para uso não controlado. */
  defaultValue?: FormAnswer[];
  onChange?: (answers: FormAnswer[]) => void;
  onSubmit?: (answers: FormAnswer[], event: FormEvent<HTMLFormElement>) => void;
  errors?: FormError[];
  /** Alias do projeto original. */
  formErrors?: FormError[];
  anonymous?: boolean;
  /** Alias do projeto original. */
  anonimo?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  style?: CSSProperties;
  submitLabel?: ReactNode;
  hideSubmit?: boolean;
  noValidate?: boolean;
  "aria-label"?: string;
}

export interface FormAnswersProps {
  /** Respostas produzidas pelo `FormRenderer`. */
  answers: readonly FormAnswer[];
  /** Conteúdo exibido quando não há respostas. */
  emptyMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}
