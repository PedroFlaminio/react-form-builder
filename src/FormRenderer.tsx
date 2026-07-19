import { useEffect, useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FieldControl } from "./FieldControl.js";
import {
  getDefaultAnswers,
  setFieldAnswer,
  toggleFieldAnswer,
} from "./model.js";
import { SensitiveFieldIndicator } from "./SensitiveFieldIndicator.js";
import type { FormAnswer, FormField, FormRendererProps } from "./types.js";

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
      {field.sensitive && <SensitiveFieldIndicator />}
    </label>
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
            <FieldControl
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
