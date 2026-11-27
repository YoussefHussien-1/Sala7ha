import { getRequestStatusDetails } from "../utils/requestFormatters";

export default function RequestStatusTracker({ status }) {
  const details = getRequestStatusDetails(status);
  const isAccepted = status === "ACCEPTED";
  const isRejected = status === "REJECTED";

  return (
    <div className="rounded-xl border border-line bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
            isAccepted
              ? "bg-emerald-100 text-emerald-700"
              : isRejected
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
          }`}
        >
          {isAccepted ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m5 12 4 4L19 6" />
            </svg>
          ) : isRejected ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          )}
        </span>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-heading">
            {details.label}
          </p>
          <p className="mt-0.5 text-sm text-secondary">
            {details.description}
          </p>
        </div>
      </div>
    </div>
  );
}
