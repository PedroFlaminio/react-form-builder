import { useEffect, useId, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  answerForField,
  answersForField,
  getDefaultAnswers,
  maskDigits,
  setFieldAnswer,
  toggleFieldAnswer,
} from "./model.js";
import type {
  FormAnswer,
  FormField,
  FormRendererProps,
} from "./types.js";

function FieldLabel({ field, htmlFor }: { field: FormField; htmlFor?: string }) {
  return (
    <label className="rfb-renderer__label" htmlFor={htmlFor}>
      {field.label}
      {field.required && (
        <span className="rfb-required" aria-label="obrigatório">
          *
        </span>
      )}
      {field.description && (
        <span
          className="rfb-help"
          title={field.description}
          aria-label={`Ajuda: ${field.description}`}
          tabIndex={0}
        >
          ?
        </span>
      )}
      {field.sensitive && (
        <span
          className="rfb-sensitive"
          title="Informação sensível"
          aria-label="Informação sensível"
        >
          ◉
        </span>
      )}
    </label>
  );
}

function FormControl({
  field,
  answers,
  disabled,
  readOnly,
  invalid,
  inputId,
  onSingleChange,
  onToggle,
}: {
  field: FormField;
  answers: FormAnswer[];
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  inputId: string;
  onSingleChange: (value: string) => void;
  onToggle: (value: string) => void;
}) {
  const answer = answerForField(answers, field);
  const value = answer?.value ?? "";
  const className = `rfb-input${invalid ? " rfb-input--invalid" : ""}`;
  const change = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => onSingleChange(event.target.value);

  if (field.type === "checkbox-group") {
    const selected = new Set(
      answersForField(answers, field).map((item) => item.value),
    );
    return (
      <fieldset className={`rfb-choice-group${invalid ? " rfb-choice-group--invalid" : ""}`}>
        <legend className="rfb-visually-hidden">{field.label}</legend>
        {field.formularioCampoOpcao?.map((option) => (
          <label key={option.id ?? option.order} className="rfb-choice">
            <input
              type="checkbox"
              checked={selected.has(option.value)}
              disabled={disabled || readOnly}
              onChange={() => onToggle(option.value)}
            />
            <span>{option.value}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (field.type === "radio-group") {
    return (
      <fieldset className={`rfb-choice-group${invalid ? " rfb-choice-group--invalid" : ""}`}>
        <legend className="rfb-visually-hidden">{field.label}</legend>
        {field.formularioCampoOpcao?.map((option) => (
          <label key={option.id ?? option.order} className="rfb-choice">
            <input
              type="radio"
              name={inputId}
              value={option.value}
              checked={value === option.value}
              disabled={disabled || readOnly}
              onChange={change}
            />
            <span>{option.value}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (field.type === "select") {
    return (
      <select
        id={inputId}
        className={className}
        value={value}
        disabled={disabled || readOnly}
        required={field.required}
        onChange={change}
        aria-invalid={invalid}
      >
        <option value="">{field.placeholder ?? "Selecione..."}</option>
        {field.formularioCampoOpcao?.map((option) => (
          <option value={option.value} key={option.id ?? option.order}>
            {option.value}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        id={inputId}
        className={className}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        required={field.required}
        placeholder={field.placeholder}
        maxLength={field.maxlength}
        rows={4}
        onChange={change}
        aria-invalid={invalid}
      />
    );
  }

  const inputType =
    field.type === "number" || field.type === "date" ? field.type : "text";
  return (
    <input
      id={inputId}
      className={className}
      type={inputType}
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      required={field.required}
      placeholder={field.placeholder}
      maxLength={field.maxlength}
      min={field.min}
      max={field.max}
      inputMode={
        field.type === "cpf" || field.type === "cnpj" || field.type === "cep"
          ? "numeric"
          : undefined
      }
      onChange={(event) =>
        onSingleChange(
          field.type === "cpf" || field.type === "cnpj" || field.type === "cep"
            ? maskDigits(event.target.value, field.type)
            : event.target.value,
        )
      }
      aria-invalid={invalid}
    />
  );
}

export function FormRenderer({
  fields,
  value: controlledValue,
  defaultValue = [],
  onChange,
  onSubmit,
  errors,
  formErrors,
  anonymous,
  anonimo,
  disabled = false,
  readOnly = false,
  className = "",
  style,
  submitLabel = "Enviar",
  hideSubmit = false,
  noValidate = false,
  "aria-label": ariaLabel = "Formulário",
}: FormRendererProps) {
  const formId = useId();
  const [internalValue, setInternalValue] = useState(() =>
    getDefaultAnswers(fields, defaultValue),
  );
  const answers = useMemo(
    () => getDefaultAnswers(fields, controlledValue ?? internalValue),
    [controlledValue, fields, internalValue],
  );
  const activeErrors = errors ?? formErrors ?? [];
  const isAnonymous = anonymous ?? anonimo ?? false;

  useEffect(() => {
    if (controlledValue === undefined) {
      setInternalValue((current) => getDefaultAnswers(fields, current));
    }
  }, [controlledValue, fields]);

  const commit = (next: FormAnswer[]) => {
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const visibleFields = fields.filter(
    (field) => !(isAnonymous && field.sensitive),
  );

  return (
    <form
      className={`rfb rfb-renderer ${className}`.trim()}
      style={style}
      aria-label={ariaLabel}
      noValidate={noValidate}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(answers, event);
      }}
    >
      {activeErrors.length > 0 && (
        <div className="rfb-error-summary" role="alert">
          <strong>Revise os campos abaixo:</strong>
          <ul>
            {activeErrors.map((error, index) => (
              <li key={`${error.field}-${index}`}>{error.error}</li>
            ))}
          </ul>
        </div>
      )}

      {visibleFields.map((field) => {
        const fieldErrors = activeErrors.filter(
          (error) => error.field === field.label,
        );
        const inputId = `${formId}-${field.id ?? field.order}`;
        return (
          <div
            className="rfb-renderer__field"
            key={field.id ?? `${field.label}-${field.order}`}
          >
            <FieldLabel field={field} htmlFor={inputId} />
            <FormControl
              field={field}
              answers={answers}
              disabled={disabled}
              readOnly={readOnly}
              invalid={fieldErrors.length > 0}
              inputId={inputId}
              onSingleChange={(nextValue) =>
                commit(setFieldAnswer(answers, field, nextValue))
              }
              onToggle={(nextValue) =>
                commit(toggleFieldAnswer(answers, field, nextValue))
              }
            />
            {fieldErrors.map((error, index) => (
              <small
                className="rfb-field-error"
                key={`${error.field}-${index}`}
              >
                {error.error}
              </small>
            ))}
          </div>
        );
      })}

      {!hideSubmit && !readOnly && (
        <div className="rfb-renderer__actions">
          <button className="rfb-button" type="submit" disabled={disabled}>
            {submitLabel as ReactNode}
          </button>
        </div>
      )}
    </form>
  );
}

export default FormRenderer;
