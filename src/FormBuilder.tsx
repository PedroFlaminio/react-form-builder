import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { FieldControl } from "./FieldControl.js";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  FieldTypeIcon,
  GripVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "./icons.js";
import {
  FIELD_CATALOG,
  createField,
  duplicateField,
  getDefaultAnswers,
  normalizeFields,
  setFieldAnswer,
  toggleDefaultOption,
  toggleFieldAnswer,
} from "./model.js";
import { SensitiveFieldIndicator } from "./SensitiveFieldIndicator.js";
import { FIELD_TYPES } from "./types.js";
import type {
  FieldType,
  FormBuilderProps,
  FormField,
  FormOption,
} from "./types.js";

type FieldDrag =
  | { kind: "new"; type: FieldType }
  | { kind: "field"; order: number }
  | null;

function reindexFields(fields: readonly FormField[]): FormField[] {
  return fields.map((field, index) => ({ ...field, order: index + 1 }));
}

function reindexOptions(options: readonly FormOption[]): FormOption[] {
  return options.map((option, index) => ({ ...option, order: index + 1 }));
}

function DropZone({
  active,
  onDrop,
}: {
  active: boolean;
  onDrop: () => void;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={[
        "rfb-drop-zone",
        active ? "rfb-drop-zone--active" : "",
        isOver ? "rfb-drop-zone--over" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (!isOver) setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsOver(false);
        onDrop();
      }}
      aria-hidden="true"
    >
      <span>Soltar campo aqui</span>
    </div>
  );
}

function OptionEditor({
  options,
  multiple,
  disabled,
  onChange,
}: {
  options: FormOption[];
  multiple: boolean;
  disabled: boolean;
  onChange: (options: FormOption[]) => void;
}) {
  const update = (order: number, patch: Partial<FormOption>) => {
    onChange(
      options.map((option) =>
        option.order === order ? { ...option, ...patch } : option,
      ),
    );
  };

  const selectDefault = (order: number) => {
    onChange(toggleDefaultOption(options, order, multiple));
  };

  const move = (order: number, direction: -1 | 1) => {
    const source = order - 1;
    const target = source + direction;
    if (target < 0 || target >= options.length) return;
    const result = [...options];
    const sourceOption = result[source];
    const targetOption = result[target];
    if (!sourceOption || !targetOption) return;
    result[source] = targetOption;
    result[target] = sourceOption;
    onChange(reindexOptions(result));
  };

  return (
    <fieldset className="rfb-options" disabled={disabled}>
      <legend>Opções</legend>
      {options.map((option) => (
        <div className="rfb-option-row" key={option.id ?? option.order}>
          <button
            className="rfb-icon-button"
            type="button"
            onClick={() => move(option.order, -1)}
            disabled={option.order === 1}
            aria-label={`Mover ${option.value} para cima`}
            title="Mover para cima"
          >
            <ArrowUpIcon />
          </button>
          <button
            className="rfb-icon-button"
            type="button"
            onClick={() => move(option.order, 1)}
            disabled={option.order === options.length}
            aria-label={`Mover ${option.value} para baixo`}
            title="Mover para baixo"
          >
            <ArrowDownIcon />
          </button>
          <input
            type={multiple ? "checkbox" : "radio"}
            name="rfb-default-option"
            checked={option.selected ?? false}
            onChange={() => selectDefault(option.order)}
            onClick={() => {
              if (!multiple && option.selected) selectDefault(option.order);
            }}
            aria-label={
              option.selected
                ? `Remover ${option.value} como valor padrão`
                : `Definir ${option.value} como valor padrão`
            }
            title={
              option.selected ? "Remover valor padrão" : "Definir como padrão"
            }
          />
          <input
            className="rfb-input"
            value={option.value}
            onChange={(event) => update(option.order, { value: event.target.value })}
            aria-label={`Texto da opção ${option.order}`}
          />
          <button
            className="rfb-icon-button rfb-icon-button--danger"
            type="button"
            onClick={() =>
              onChange(
                reindexOptions(
                  options.filter((item) => item.order !== option.order),
                ),
              )
            }
            aria-label={`Remover ${option.value}`}
            title="Remover opção"
          >
            <TrashIcon />
          </button>
        </div>
      ))}
      <button
        className="rfb-button rfb-button--secondary"
        type="button"
        onClick={() =>
          onChange([
            ...options,
            {
              order: options.length + 1,
              value: `Opção ${options.length + 1}`,
              selected: false,
            },
          ])
        }
      >
        <PlusIcon />
        Adicionar opção
      </button>
    </fieldset>
  );
}

function FieldEditor({
  field,
  disabled,
  onCancel,
  onSave,
}: {
  field: FormField;
  disabled: boolean;
  onCancel: () => void;
  onSave: (field: FormField) => void;
}) {
  const [draft, setDraft] = useState<FormField>(() => ({
    ...field,
    formularioCampoOpcao: field.formularioCampoOpcao?.map((option) => ({
      ...option,
    })),
  }));
  const previewFieldId = field.id ?? `rfb-editor-preview-${field.order}`;
  const [previewAnswers, setPreviewAnswers] = useState(() =>
    getDefaultAnswers([{ ...field, id: previewFieldId }]),
  );
  const previewField = { ...draft, id: previewFieldId };
  const previewInputId = `rfb-editor-preview-input-${previewFieldId}`;
  const needsOptions =
    draft.type === "select" ||
    draft.type === "radio-group" ||
    draft.type === "checkbox-group";

  const patch = (value: Partial<FormField>) =>
    setDraft((current) => ({ ...current, ...value }));

  return (
    <section className="rfb-editor" aria-label={`Editar ${field.label}`}>
      <div className="rfb-editor__heading">
        <span className="rfb-type-icon">
          <FieldTypeIcon type={field.type} />
        </span>
        <div>
          <strong>Editar campo</strong>
          <small>{FIELD_CATALOG[field.type].label}</small>
        </div>
      </div>

      <div className="rfb-editor__preview">
        <label
          className="rfb-editor__preview-label"
          htmlFor={previewInputId}
        >
          {draft.label || "Título do campo"}
          {draft.required && <span className="rfb-required">*</span>}
          {draft.description && (
            <span
              className="rfb-help"
              title={draft.description}
              aria-label={`Ajuda: ${draft.description}`}
              tabIndex={0}
            >
              ?
            </span>
          )}
          {draft.sensitive && <SensitiveFieldIndicator />}
        </label>
        <FieldControl
          field={previewField}
          answers={previewAnswers}
          disabled={false}
          readOnly={false}
          invalid={false}
          inputId={previewInputId}
          onSingleChange={(value) =>
            setPreviewAnswers((current) =>
              setFieldAnswer(current, previewField, value),
            )
          }
          onToggle={(value) =>
            setPreviewAnswers((current) =>
              toggleFieldAnswer(current, previewField, value),
            )
          }
        />
      </div>

      <div className="rfb-grid">
        <label className="rfb-control rfb-control--wide">
          <span>Título</span>
          <input
            className="rfb-input"
            value={draft.label}
            onChange={(event) => patch({ label: event.target.value })}
            autoFocus
          />
        </label>

        {draft.type !== "date" &&
          draft.type !== "radio-group" &&
          draft.type !== "checkbox-group" && (
            <label className="rfb-control">
              <span>Placeholder</span>
              <input
                className="rfb-input"
                value={draft.placeholder ?? ""}
                onChange={(event) => patch({ placeholder: event.target.value })}
              />
            </label>
          )}

        <label className="rfb-control">
          <span>Texto de ajuda</span>
          <input
            className="rfb-input"
            value={draft.description ?? ""}
            onChange={(event) => patch({ description: event.target.value })}
          />
        </label>

        {(draft.type === "text" || draft.type === "textarea") && (
          <label className="rfb-control">
            <span>Tamanho máximo</span>
            <input
              className="rfb-input"
              type="number"
              min="1"
              value={draft.maxlength ?? ""}
              onChange={(event) =>
                patch({
                  maxlength:
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                })
              }
            />
          </label>
        )}

        {draft.type === "number" && (
          <>
            <label className="rfb-control">
              <span>Mínimo</span>
              <input
                className="rfb-input"
                type="number"
                value={draft.min ?? ""}
                onChange={(event) =>
                  patch({
                    min:
                      event.target.value === ""
                        ? undefined
                        : Number(event.target.value),
                  })
                }
              />
            </label>
            <label className="rfb-control">
              <span>Máximo</span>
              <input
                className="rfb-input"
                type="number"
                value={draft.max ?? ""}
                onChange={(event) =>
                  patch({
                    max:
                      event.target.value === ""
                        ? undefined
                        : Number(event.target.value),
                  })
                }
              />
            </label>
          </>
        )}
      </div>

      {needsOptions && (
        <OptionEditor
          options={draft.formularioCampoOpcao ?? []}
          multiple={draft.type === "checkbox-group"}
          disabled={disabled}
          onChange={(formularioCampoOpcao) => patch({ formularioCampoOpcao })}
        />
      )}

      <div className="rfb-checks">
        <label>
          <input
            type="checkbox"
            checked={draft.required ?? false}
            onChange={(event) => patch({ required: event.target.checked })}
          />
          Obrigatório
        </label>
        <label>
          <input
            type="checkbox"
            checked={draft.sensitive ?? false}
            onChange={(event) => patch({ sensitive: event.target.checked })}
          />
          Dado sensível
        </label>
      </div>

      <div className="rfb-actions">
        <button
          className="rfb-button rfb-button--ghost"
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          className="rfb-button"
          type="button"
          disabled={disabled || draft.label.trim() === ""}
          onClick={() => onSave(draft)}
        >
          Salvar campo
        </button>
      </div>
    </section>
  );
}

function FieldEditorModal({
  field,
  disabled,
  onCancel,
  onSave,
}: {
  field: FormField;
  disabled: boolean;
  onCancel: () => void;
  onSave: (field: FormField) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    return () => {
      if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="rfb-modal"
      aria-label={`Editar ${field.label}`}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;

        const bounds = event.currentTarget.getBoundingClientRect();
        const clickedOutside =
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom;

        if (clickedOutside) onCancel();
      }}
    >
      <FieldEditor
        field={field}
        disabled={disabled}
        onCancel={onCancel}
        onSave={onSave}
      />
    </dialog>
  );
}

export function FormBuilder({
  fields: controlledFields,
  defaultFields = [],
  onChange,
  allowedTypes = FIELD_TYPES,
  disabled = false,
  className = "",
  style,
  emptyMessage = "Arraste um campo para cá ou use o duplo clique.",
  "aria-label": ariaLabel = "Construtor de formulário",
}: FormBuilderProps) {
  const [internalFields, setInternalFields] = useState(() =>
    normalizeFields(defaultFields),
  );
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [drag, setDrag] = useState<FieldDrag>(null);
  const fields = useMemo(
    () => normalizeFields(controlledFields ?? internalFields),
    [controlledFields, internalFields],
  );

  const commit = (nextFields: FormField[]) => {
    const reindexed = reindexFields(nextFields);
    if (controlledFields === undefined) setInternalFields(reindexed);
    onChange?.(reindexed);
  };

  const add = (type: FieldType, position = fields.length) => {
    if (disabled) return;
    const next = [...fields];
    next.splice(position, 0, createField(type, position + 1));
    commit(next);
  };

  const dropAt = (position: number) => {
    if (!drag || disabled) return;
    if (drag.kind === "new") {
      add(drag.type, position);
    } else {
      const sourceIndex = fields.findIndex(
        (field) => field.order === drag.order,
      );
      if (sourceIndex < 0) return;
      const next = [...fields];
      const [moved] = next.splice(sourceIndex, 1);
      if (!moved) return;
      const destination = sourceIndex < position ? position - 1 : position;
      next.splice(destination, 0, moved);
      commit(next);
    }
    setDrag(null);
  };

  const startDrag = (event: DragEvent, value: Exclude<FieldDrag, null>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    setDrag(value);
    event.dataTransfer.effectAllowed = value.kind === "new" ? "copy" : "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(value));
  };

  return (
    <div
      className={`rfb rfb-builder ${className}`.trim()}
      style={style}
      aria-label={ariaLabel}
    >
      <main className="rfb-canvas">
        {fields.length === 0 ? (
          <div
            className={`rfb-empty${drag ? " rfb-empty--active" : ""}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              dropAt(0);
            }}
          >
            <span className="rfb-empty__icon">
              <PlusIcon />
            </span>
            <span>{emptyMessage}</span>
          </div>
        ) : (
          <div
            className={`rfb-field-list${
              drag !== null ? " rfb-field-list--dragging" : ""
            }`}
          >
            <DropZone active={drag !== null} onDrop={() => dropAt(0)} />
            {fields.map((field, index) => (
              <div key={field.id ?? `${field.type}-${field.order}`}>
                <article
                  className="rfb-field-card"
                  draggable={!disabled && editingOrder === null}
                  onDragStart={(event) =>
                    startDrag(event, { kind: "field", order: field.order })
                  }
                  onDragEnd={() => setDrag(null)}
                  onDoubleClick={() =>
                    !disabled && setEditingOrder(field.order)
                  }
                >
                  <span
                    className="rfb-drag-handle"
                    title="Arraste para reordenar"
                    aria-hidden="true"
                  >
                    <GripVerticalIcon />
                  </span>
                  <div className="rfb-field-card__content">
                    <strong>
                      {field.label}
                      {field.required && (
                        <span className="rfb-required" title="Obrigatório">
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
                    </strong>
                    <div
                      className="rfb-field-card__preview"
                      aria-hidden="true"
                    >
                      <FieldControl
                        field={field}
                        answers={getDefaultAnswers([field])}
                        disabled={false}
                        readOnly
                        invalid={false}
                        inputId={`rfb-preview-${field.id ?? field.order}`}
                        tabIndex={-1}
                        onSingleChange={() => undefined}
                        onToggle={() => undefined}
                      />
                    </div>
                  </div>
                  <div className="rfb-card-actions">
                    <button
                      type="button"
                      className="rfb-icon-button"
                      onClick={() => {
                        const currentIndex = field.order - 1;
                        if (currentIndex <= 0) return;
                        const next = [...fields];
                        const previous = next[currentIndex - 1];
                        if (!previous) return;
                        next[currentIndex - 1] = field;
                        next[currentIndex] = previous;
                        commit(next);
                      }}
                      disabled={disabled || field.order === 1}
                      aria-label={`Mover ${field.label} para cima`}
                      title="Mover para cima"
                    >
                      <ArrowUpIcon />
                    </button>
                    <button
                      type="button"
                      className="rfb-icon-button"
                      onClick={() => {
                        const currentIndex = field.order - 1;
                        if (currentIndex >= fields.length - 1) return;
                        const next = [...fields];
                        const following = next[currentIndex + 1];
                        if (!following) return;
                        next[currentIndex] = following;
                        next[currentIndex + 1] = field;
                        commit(next);
                      }}
                      disabled={disabled || field.order === fields.length}
                      aria-label={`Mover ${field.label} para baixo`}
                      title="Mover para baixo"
                    >
                      <ArrowDownIcon />
                    </button>
                    <button
                      type="button"
                      className="rfb-icon-button"
                      onClick={() => setEditingOrder(field.order)}
                      disabled={disabled}
                      aria-label={`Editar ${field.label}`}
                      title="Editar"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      className="rfb-icon-button"
                      onClick={() =>
                        commit([
                          ...fields,
                          duplicateField(field, fields.length + 1),
                        ])
                      }
                      disabled={disabled}
                      aria-label={`Duplicar ${field.label}`}
                      title="Duplicar"
                    >
                      <CopyIcon />
                    </button>
                    <button
                      type="button"
                      className="rfb-icon-button rfb-icon-button--danger"
                      onClick={() =>
                        commit(
                          fields.filter(
                            (item) => item.order !== field.order,
                          ),
                        )
                      }
                      disabled={disabled}
                      aria-label={`Excluir ${field.label}`}
                      title="Excluir"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </article>
                {editingOrder === field.order && (
                  <FieldEditorModal
                    key={`editor-${field.order}`}
                    field={field}
                    disabled={disabled}
                    onCancel={() => setEditingOrder(null)}
                    onSave={(updated) => {
                      commit(
                        fields.map((item) =>
                          item.order === field.order
                            ? { ...updated, order: item.order }
                            : item,
                        ),
                      );
                      setEditingOrder(null);
                    }}
                  />
                )}
                <DropZone
                  active={drag !== null}
                  onDrop={() => dropAt(index + 1)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <aside className="rfb-palette" aria-label="Tipos de campo">
        <div className="rfb-palette__heading">
          <strong>Campos</strong>
          <small>Arraste ou clique para adicionar</small>
        </div>
        <div className="rfb-palette__list">
          {allowedTypes.map((type) => {
            const item = FIELD_CATALOG[type];
            return (
              <button
                className="rfb-palette-item"
                type="button"
                draggable={!disabled}
                disabled={disabled}
                onDragStart={(event) =>
                  startDrag(event, { kind: "new", type })
                }
                onDragEnd={() => setDrag(null)}
                onClick={() => add(type)}
                key={type}
              >
                <span className="rfb-type-icon">
                  <FieldTypeIcon type={type} />
                </span>
                <span>{item.label}</span>
                <span className="rfb-palette-item__add">
                  <PlusIcon />
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

export default FormBuilder;
