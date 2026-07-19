# react-form-builder

Biblioteca de construção e renderização de formulários para React, escrita em
TypeScript e sem dependências de interface externas.

- Construtor visual com adição, edição, cópia, remoção e reordenação de campos.
- Renderizador com respostas controladas ou não controladas.
- Validação de campos obrigatórios e máscaras de CPF, CNPJ e CEP.
- Suporte a campos sensíveis e formulários anônimos.
- Tipos TypeScript e helpers exportados pela API pública.
- React como única dependência de runtime, declarada como `peerDependency`.

## Requisitos

- Node.js 18 ou superior
- React 18 ou superior

## Instalação

```bash
npm install react-form-builder
```

O entrypoint principal já importa os estilos da biblioteca. Caso a ferramenta
de build da aplicação exija uma importação explícita de CSS, adicione:

```tsx
import "react-form-builder/styles.css";
```

## Uso rápido

### Construir um formulário

O `FormBuilder` pode ser usado como componente controlado:

```tsx
import { useState } from "react";
import { FormBuilder, type FormField } from "react-form-builder";

export function EditorDeFormulario() {
  const [fields, setFields] = useState<FormField[]>([]);

  return (
    <FormBuilder
      fields={fields}
      onChange={setFields}
      aria-label="Editor do formulário de contato"
    />
  );
}
```

Ou como componente não controlado, por meio de `defaultFields`:

```tsx
<FormBuilder
  defaultFields={[
    {
      order: 1,
      type: "text",
      label: "Nome",
      placeholder: "Digite seu nome",
      required: true,
    },
  ]}
  onChange={(fields) => console.log(fields)}
/>;
```

O construtor permite arrastar campos da paleta, adicioná-los com duplo clique,
alterar suas configurações, duplicá-los e reorganizá-los.

### Renderizar e validar o formulário

```tsx
import { useState } from "react";
import {
  FormRenderer,
  validateForm,
  type FormAnswer,
  type FormError,
  type FormField,
} from "react-form-builder";

type ContactFormProps = {
  fields: FormField[];
};

export function FormularioDeContato({ fields }: ContactFormProps) {
  const [answers, setAnswers] = useState<FormAnswer[]>([]);
  const [errors, setErrors] = useState<FormError[]>([]);

  return (
    <FormRenderer
      fields={fields}
      value={answers}
      onChange={setAnswers}
      errors={errors}
      submitLabel="Salvar respostas"
      onSubmit={(nextAnswers) => {
        const nextErrors = validateForm(nextAnswers, fields);
        setErrors(nextErrors);

        if (nextErrors.length === 0) {
          console.log("Respostas válidas:", nextAnswers);
        }
      }}
    />
  );
}
```

Para uso não controlado, substitua `value` por `defaultValue`. O callback
`onChange` continua disponível para observar cada alteração.

## Tipos de campo

| Tipo | Descrição |
| --- | --- |
| `text` | Texto em uma linha |
| `number` | Número com limites mínimo e máximo opcionais |
| `date` | Data |
| `cpf` | CPF com máscara |
| `cnpj` | CNPJ com máscara |
| `cep` | CEP com máscara |
| `textarea` | Texto em várias linhas |
| `select` | Lista de seleção |
| `radio-group` | Grupo de escolha única |
| `checkbox-group` | Grupo de escolhas múltiplas |

Uma definição de campo usa o seguinte contrato:

```ts
type FormField = {
  id?: string | number;
  order: number;
  type:
    | "text"
    | "number"
    | "date"
    | "cpf"
    | "cnpj"
    | "cep"
    | "textarea"
    | "select"
    | "radio-group"
    | "checkbox-group";
  label: string;
  required?: boolean;
  sensitive?: boolean;
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  maxlength?: number;
  formularioCampoOpcao?: FormOption[];
};

type FormOption = {
  id?: string | number;
  order: number;
  value: string;
  selected?: boolean;
};
```

As respostas são representadas por:

```ts
type FormAnswer = {
  id?: string | number;
  fieldId?: string | number;
  order?: number;
  label: string;
  value: string;
  type?: FieldType | string;
  sensitive?: boolean;
};
```

Campos de seleção múltipla geram uma resposta por opção marcada. Os demais
campos geram uma única resposta.

## Propriedades dos componentes

### `FormBuilder`

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| `fields` | `FormField[]` | Campos no modo controlado |
| `defaultFields` | `FormField[]` | Campos iniciais no modo não controlado |
| `onChange` | `(fields) => void` | Executado após cada alteração |
| `allowedTypes` | `readonly FieldType[]` | Restringe os tipos exibidos na paleta |
| `disabled` | `boolean` | Bloqueia alterações |
| `emptyMessage` | `ReactNode` | Mensagem exibida quando não há campos |
| `className` | `string` | Classe adicional no elemento raiz |
| `style` | `CSSProperties` | Estilos inline do elemento raiz |
| `aria-label` | `string` | Nome acessível do construtor |

### `FormRenderer`

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| `fields` | `FormField[]` | Definição dos campos |
| `value` | `FormAnswer[]` | Respostas no modo controlado |
| `defaultValue` | `FormAnswer[]` | Respostas iniciais no modo não controlado |
| `onChange` | `(answers) => void` | Executado quando uma resposta muda |
| `onSubmit` | `(answers, event) => void` | Executado no envio do formulário |
| `errors` | `FormError[]` | Erros apresentados no resumo e nos campos |
| `anonymous` | `boolean` | Oculta campos marcados como sensíveis |
| `disabled` | `boolean` | Desabilita campos e envio |
| `readOnly` | `boolean` | Impede edição e oculta o botão de envio |
| `submitLabel` | `ReactNode` | Conteúdo do botão de envio |
| `hideSubmit` | `boolean` | Oculta o botão de envio |
| `noValidate` | `boolean` | Define o atributo HTML `noValidate` |
| `className` | `string` | Classe adicional no formulário |
| `style` | `CSSProperties` | Estilos inline do formulário |
| `aria-label` | `string` | Nome acessível do formulário |

`FormRender`, `formErrors` e `anonimo` são aliases mantidos para facilitar a
migração de integrações existentes.

## Validação

`validateForm` verifica os campos obrigatórios e sempre retorna um array:

```ts
const errors = validateForm(answers, fields, anonymous);

if (errors.length === 0) {
  // formulário válido
}
```

Cada erro possui o formato:

```ts
type FormError = {
  field: string;
  error: string;
};
```

O helper legado `validate` executa a mesma validação, mas retorna `undefined`
quando não existem erros.

## API pública

Componentes:

- `FormBuilder`
- `FormRenderer`
- `FormRender` — alias de `FormRenderer`

Constantes:

- `FIELD_TYPES`
- `FIELD_CATALOG`

Helpers de campos e opções:

- `createField`
- `duplicateField`
- `normalizeFields`
- `normalizeOptions`
- `isFieldType`

Helpers de respostas:

- `createAnswer`
- `answerForField`
- `answersForField`
- `getDefaultAnswers`
- `getDefaultAnswersFromFields` — alias de migração
- `setFieldAnswer`
- `toggleFieldAnswer`

Validação e máscaras:

- `validateForm`
- `validate`
- `maskDigits`

Tipos principais:

- `FieldType` / `TipoType`
- `FormField` / `FormFieldType`
- `FormAnswer` / `Answer`
- `FormOption`
- `FormError`
- `FormDefinition` / `Formulario`
- `FormBuilderProps`
- `FormRendererProps`

## Personalização visual

Os componentes usam classes com o prefixo `rfb-` e variáveis CSS. Elas podem
ser sobrescritas em um contêiner da aplicação:

```css
.meu-formulario {
  --rfb-primary: #6d28d9;
  --rfb-primary-dark: #5b21b6;
  --rfb-primary-soft: #f3e8ff;
  --rfb-danger: #b91c1c;
  --rfb-border: #ddd6fe;
  --rfb-text: #1f2937;
  --rfb-surface: #ffffff;
  --rfb-canvas: #fafafa;
  --rfb-radius: 8px;
}
```

```tsx
<FormRenderer className="meu-formulario" fields={fields} />
```

## Migração do Central 156

Na implementação anterior, os componentes conheciam propriedades de um objeto
externo:

```tsx
<FormBuilder field="formularioCampo" />
<FormRender fields={item.formularioCampo} fieldRespostas="respostas" />
```

Nesta biblioteca, o estado é explícito:

```tsx
<FormBuilder
  fields={item.formularioCampo}
  onChange={(formularioCampo) => setItem({ ...item, formularioCampo })}
/>

<FormRenderer
  fields={item.formularioCampo}
  value={item.respostas}
  onChange={(respostas) => setItem({ ...item, respostas })}
/>
```

Os aliases `FormRender`, `FormFieldType`, `Answer`, `TipoType`, `Formulario`,
`getDefaultAnswersFromFields`, `formErrors` e `anonimo` ajudam na migração do
contrato original.

## Desenvolvimento

```bash
npm install
npm run check
npm test
npm run build
```

| Comando | Finalidade |
| --- | --- |
| `npm run check` | Verifica os tipos sem gerar arquivos |
| `npm test` | Gera o pacote e executa os testes |
| `npm run build` | Compila JavaScript, tipos e CSS em `dist` |
| `npm pack` | Gera o arquivo de pacote para inspeção |

## Publicação

Confira o nome e os metadados no `package.json`, autentique-se no npm e execute:

```bash
npm run check
npm test
npm pack
npm publish
```

O pacote publicado contém `dist`, `README.md` e `LICENSE`.
