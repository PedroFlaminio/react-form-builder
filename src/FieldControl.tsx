import type { ChangeEvent } from "react";
import { ArrowDownIcon } from "./icons.js";
import {
  DEFAULT_CURRENCY_PREFIX,
  DEFAULT_PHONE_PREFIX,
  answerForField,
  answersForField,
  maskCurrency,
  maskDigits,
  maskPhone,
} from "./model.js";
import type { FormAnswer, FormField } from "./types.js";

export function FieldControl({
  field,
  answers,
  disabled,
  readOnly,
  invalid,
  inputId,
  tabIndex,
  onSingleChange,
  onToggle,
}: {
  field: FormField;
  answers: FormAnswer[];
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  inputId: string;
  tabIndex?: number;
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
              tabIndex={tabIndex}
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
        {field.formularioCampoOpcao?.map((option) => {
          const checked = value === option.value;
          return (
            <label key={option.id ?? option.order} className="rfb-choice">
              <input
                type="radio"
                name={inputId}
                value={option.value}
                checked={checked}
                disabled={disabled || readOnly}
                tabIndex={tabIndex}
                onChange={change}
                onClick={() => {
                  if (checked) onToggle(option.value);
                }}
                aria-label={
                  checked
                    ? `${option.value}. Clique novamente para remover a seleção`
                    : option.value
                }
                title={checked ? "Remover seleção" : undefined}
              />
              <span>{option.value}</span>
            </label>
          );
        })}
      </fieldset>
    );
  }

  if (field.type === "select") {
    return (
      <span className="rfb-select">
        <select
          id={inputId}
          className={className}
          value={value}
          disabled={disabled || readOnly}
          required={field.required}
          tabIndex={tabIndex}
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
        <ArrowDownIcon />
      </span>
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
        tabIndex={tabIndex}
        onChange={change}
        aria-invalid={invalid}
      />
    );
  }

  if (field.type === "currency" || field.type === "phone") {
    const isCurrency = field.type === "currency";
    const prefix =
      field.prefix ??
      (isCurrency ? DEFAULT_CURRENCY_PREFIX : DEFAULT_PHONE_PREFIX);
    const affixedClassName = [
      "rfb-affixed-input",
      invalid ? "rfb-affixed-input--invalid" : "",
      disabled || readOnly ? "rfb-affixed-input--disabled" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span className={affixedClassName}>
        {prefix !== "" && (
          <span className="rfb-affixed-input__prefix" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className="rfb-input rfb-affixed-input__control"
          type={isCurrency ? "text" : "tel"}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          required={field.required}
          placeholder={field.placeholder}
          tabIndex={tabIndex}
          inputMode="numeric"
          onChange={(event) =>
            onSingleChange(
              isCurrency
                ? maskCurrency(event.target.value)
                : maskPhone(event.target.value, prefix),
            )
          }
          onKeyDown={(event) => {
            if (
              !isCurrency ||
              event.key !== "Backspace" ||
              event.currentTarget.selectionStart !== value.length ||
              event.currentTarget.selectionEnd !== value.length
            ) {
              return;
            }

            event.preventDefault();
            const digits = value
              .replace(/\D/g, "")
              .replace(/^0+/, "")
              .slice(0, -1);
            onSingleChange(maskCurrency(digits));
          }}
          aria-invalid={invalid}
        />
      </span>
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
      tabIndex={tabIndex}
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
