import "./styles.css";

export { FormBuilder } from "./FormBuilder.js";
export { FormRenderer, FormRenderer as FormRender } from "./FormRenderer.js";
export {
  FIELD_CATALOG,
  answerForField,
  answersForField,
  createAnswer,
  createField,
  duplicateField,
  getDefaultAnswers,
  getDefaultAnswersFromFields,
  isFieldType,
  maskDigits,
  normalizeFields,
  normalizeOptions,
  setFieldAnswer,
  toggleFieldAnswer,
  validate,
  validateForm,
} from "./model.js";
export { FIELD_TYPES } from "./types.js";
export type {
  Answer,
  FieldType,
  FormAnswer,
  FormBuilderProps,
  FormDefinition,
  FormError,
  FormField,
  FormFieldType,
  FormOption,
  FormRendererProps,
  Formulario,
  TipoType,
} from "./types.js";
