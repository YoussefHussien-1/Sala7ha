import { getRequestStatusDetails } from "../utils/requestFormatters";

export default function RequestStatusBadge({ status }) {
  const details = getRequestStatusDetails(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${details.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${details.dotClass}`} />
      {details.label}
    </span>
  );
}
