import { SensitiveFieldIcon } from "./icons.js";

export function SensitiveFieldIndicator() {
  return (
    <span
      className="rfb-sensitive"
      title="Campo com dado sensível"
      aria-label="Campo com dado sensível"
      tabIndex={0}
    >
      <SensitiveFieldIcon />
    </span>
  );
}
