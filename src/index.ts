import "./styles.css";

export { FormBuilder } from "./FormBuilder.js";
export { FormRenderer, FormRenderer as FormRender } from "./FormRenderer.js";
export { FormAnswers } from "./FormAnswers.js";
export {
  DEFAULT_CURRENCY_PREFIX,
  DEFAULT_PHONE_PREFIX,
  FIELD_CATALOG,
  answerForField,
  answersForField,
  createAnswer,
  createField,
  duplicateField,
  getDefaultAnswers,
  getDefaultAnswersFromFields,
  isFieldType,
  maskCurrency,
  maskDigits,
  maskPhone,
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
  FormAnswersProps,
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
