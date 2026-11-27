export function formatScheduledAt(value) {
  if (!value) return "Not specified";

  // The current schema stores scheduledAt as "YYYY-MM-DD HH:mm".
  const normalizedValue = value.includes("T")
    ? value
    : value.replace(" ", "T");
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatCreatedAt(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getRequestStatusDetails(status) {
  const details = {
    PENDING: {
      label: "Pending",
      description: "Waiting for the technician to respond.",
      badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
      dotClass: "bg-amber-500",
    },
    ACCEPTED: {
      label: "Accepted",
      description: "The technician accepted your request.",
      badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      dotClass: "bg-emerald-500",
    },
    REJECTED: {
      label: "Rejected",
      description: "The technician could not accept this request.",
      badgeClass: "bg-red-50 text-red-700 ring-red-200",
      dotClass: "bg-red-500",
    },
  };

  return details[status] || {
    label: status || "Unknown",
    description: "The request status is not available.",
    badgeClass: "bg-slate-100 text-slate-600 ring-slate-200",
    dotClass: "bg-slate-400",
  };
}
