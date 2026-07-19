import { SensitiveFieldIndicator } from "./SensitiveFieldIndicator.js";
import type { FormAnswer, FormAnswersProps } from "./types.js";

interface AnswerGroup {
  key: string;
  label: string;
  order?: number;
  sensitive: boolean;
  type: FormAnswer["type"];
  values: string[];
  index: number;
}

function formatAnswerValue(value: string, type: FormAnswer["type"]): string {
  if (type !== "date") return value;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function groupAnswers(answers: readonly FormAnswer[]): AnswerGroup[] {
  const groups = new Map<string, AnswerGroup>();

  answers.forEach((answer, index) => {
    const key =
      answer.fieldId === undefined
        ? `label:${answer.label}`
        : `field:${typeof answer.fieldId}:${answer.fieldId}`;
    const current = groups.get(key);

    if (current) {
      current.values.push(answer.value);
      current.sensitive ||= answer.sensitive ?? false;
      if (
        answer.order !== undefined &&
        (current.order === undefined || answer.order < current.order)
      ) {
        current.order = answer.order;
      }
      return;
    }

    const group: AnswerGroup = {
      key,
      label: answer.label,
      sensitive: answer.sensitive ?? false,
      type: answer.type,
      values: [answer.value],
      index,
    };
    if (answer.order !== undefined) group.order = answer.order;
    groups.set(key, group);
  });

  return [...groups.values()].sort(
    (left, right) =>
      (left.order ?? Number.POSITIVE_INFINITY) -
        (right.order ?? Number.POSITIVE_INFINITY) || left.index - right.index,
  );
}

export function FormAnswers({
  answers,
  emptyMessage = "Nenhuma resposta enviada.",
  className = "",
  style,
  "aria-label": ariaLabel = "Respostas do formulário",
}: FormAnswersProps) {
  const groups = groupAnswers(answers);

  return (
    <section
      className={`rfb rfb-answers ${className}`.trim()}
      style={style}
      aria-label={ariaLabel}
    >
      {groups.length === 0 ? (
        <div className="rfb-answers__empty">{emptyMessage}</div>
      ) : (
        <dl className="rfb-answers__list">
          {groups.map((group) => (
            <div className="rfb-answers__item" key={group.key}>
              <dt className="rfb-answers__label">
                {group.label}
                {group.sensitive && <SensitiveFieldIndicator />}
              </dt>
              <dd className="rfb-answers__value">
                {group.sensitive ? (
                  <span className="rfb-answers__hidden">Resposta ocultada</span>
                ) : group.values.length === 1 ? (
                  <span className={group.values[0]?.trim() ? "" : "rfb-answers__unanswered"}>
                    {group.values[0]?.trim()
                      ? formatAnswerValue(group.values[0], group.type)
                      : "Não informado"}
                  </span>
                ) : (
                  <ul className="rfb-answers__values">
                    {group.values.map((value, index) => (
                      <li
                        className={value.trim() ? "" : "rfb-answers__unanswered"}
                        key={`${value}-${index}`}
                      >
                        {value.trim() ? formatAnswerValue(value, group.type) : "Não informado"}
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export default FormAnswers;
