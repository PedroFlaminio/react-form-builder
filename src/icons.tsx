import type { ReactNode } from "react";
import type { FieldType } from "./types.js";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="rfb-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function ArrowUpIcon() {
  return (
    <Icon>
      <path d="m18 15-6-6-6 6" />
    </Icon>
  );
}

export function ArrowDownIcon() {
  return (
    <Icon>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function PencilIcon() {
  return (
    <Icon>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  );
}

export function CopyIcon() {
  return (
    <Icon>
      <rect width="13" height="13" x="9" y="9" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Icon>
  );
}

export function TrashIcon() {
  return (
    <Icon>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </Icon>
  );
}

export function PlusIcon() {
  return (
    <Icon>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function GripVerticalIcon() {
  return (
    <Icon>
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function SensitiveFieldIcon() {
  return (
    <Icon>
      <rect width="14" height="11" x="5" y="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </Icon>
  );
}

function TextFieldIcon() {
  return (
    <Icon>
      <path d="M4 6V4h16v2" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </Icon>
  );
}

function NumberFieldIcon() {
  return (
    <Icon>
      <path d="M10 3 8 21" />
      <path d="m16 3-2 18" />
      <path d="M4 9h16" />
      <path d="M3 15h16" />
    </Icon>
  );
}

function DateFieldIcon() {
  return (
    <Icon>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </Icon>
  );
}

function CpfFieldIcon() {
  return (
    <Icon>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <circle cx="8" cy="10" r="2" />
      <path d="M5 16c.7-1.5 1.7-2 3-2s2.3.5 3 2" />
      <path d="M14 9h5" />
      <path d="M14 13h4" />
    </Icon>
  );
}

function CnpjFieldIcon() {
  return (
    <Icon>
      <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
      <path d="M3 21h18" />
      <path d="M8 7h2" />
      <path d="M14 7h2" />
      <path d="M8 11h2" />
      <path d="M14 11h2" />
      <path d="M9 21v-5h6v5" />
    </Icon>
  );
}

function CepFieldIcon() {
  return (
    <Icon>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  );
}

function TextareaFieldIcon() {
  return (
    <Icon>
      <path d="M4 6h16" />
      <path d="M4 10h16" />
      <path d="M4 14h10" />
      <path d="M4 18h7" />
    </Icon>
  );
}

function SelectFieldIcon() {
  return (
    <Icon>
      <circle cx="5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1" fill="currentColor" stroke="none" />
      <path d="M9 6h10" />
      <path d="M9 12h10" />
      <path d="M9 18h10" />
    </Icon>
  );
}

function RadioGroupFieldIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </Icon>
  );
}

function CheckboxGroupFieldIcon() {
  return (
    <Icon>
      <rect width="18" height="18" x="3" y="3" rx="3" />
      <path d="m8 12 3 3 5-6" />
    </Icon>
  );
}

export function FieldTypeIcon({ type }: { type: FieldType }) {
  switch (type) {
    case "text":
      return <TextFieldIcon />;
    case "number":
      return <NumberFieldIcon />;
    case "date":
      return <DateFieldIcon />;
    case "cpf":
      return <CpfFieldIcon />;
    case "cnpj":
      return <CnpjFieldIcon />;
    case "cep":
      return <CepFieldIcon />;
    case "textarea":
      return <TextareaFieldIcon />;
    case "select":
      return <SelectFieldIcon />;
    case "radio-group":
      return <RadioGroupFieldIcon />;
    case "checkbox-group":
      return <CheckboxGroupFieldIcon />;
  }
}
