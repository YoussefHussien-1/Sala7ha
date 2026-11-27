import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import RequestStatusBadge from "../components/RequestStatusBadge";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import {
  formatCreatedAt,
  formatScheduledAt,
} from "../utils/requestFormatters";

const FILTERS = [
  { value: "ALL", label: "All requests" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

function InfoItem({ label, value }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-heading">
        {value}
      </p>
    </div>
  );
}

export default function TechnicianRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "TECHNICIAN") {
      navigate("/requests", { replace: true });
      return;
    }

    let cancelled = false;

    const loadRequests = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/requests/technician");
        if (!cancelled) {
          setRequests(response.data.requests || []);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Could not load your incoming requests. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  const counts = useMemo(() => {
    return requests.reduce(
      (result, request) => {
        result.ALL += 1;
        if (result[request.status] !== undefined) {
          result[request.status] += 1;
        }
        return result;
      },
      { ALL: 0, PENDING: 0, ACCEPTED: 0, REJECTED: 0 }
    );
  }, [requests]);

  const visibleRequests = useMemo(() => {
    if (activeFilter === "ALL") return requests;
    return requests.filter((request) => request.status === activeFilter);
  }, [requests, activeFilter]);

  const handleStatusUpdate = async (requestId, status) => {
    if (updatingId) return;

    setUpdatingId(requestId);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch(`/requests/${requestId}/status`, {
        status,
      });

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId ? response.data.request : request
        )
      );

      setSuccess(
        status === "ACCEPTED"
          ? "Request accepted successfully."
          : "Request rejected successfully."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not update this request. Please try again."
      );
    } finally {
      setUpdatingId("");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <p className="text-sm font-medium text-secondary">
          Loading incoming requests...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "TECHNICIAN") return null;

  return (
    <section className="mx-auto max-w-6xl py-6 sm:py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Technician dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Incoming Requests
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
            Review service requests assigned to you and decide whether to accept or reject them.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-secondary self-start sm:self-auto"
        >
          Refresh requests
        </button>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FILTERS.map((filter) => (
          <div key={filter.value} className="card p-4">
            <p className="text-sm text-secondary">{filter.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-heading">
              {counts[filter.value]}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeFilter === filter.value
                ? "bg-primary text-white"
                : "border border-line bg-white text-secondary hover:bg-slate-50"
            }`}
          >
            {filter.label}
            <span className="ml-2 opacity-75">{counts[filter.value]}</span>
          </button>
        ))}
      </div>

      {visibleRequests.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13Z" />
              <path d="M8 8h8M8 12h8M8 16h4" />
            </svg>
          </div>
          <h2 className="mt-5 text-lg font-bold text-heading">
            {activeFilter === "ALL"
              ? "No incoming requests yet"
              : `No ${activeFilter.toLowerCase()} requests`}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
            {activeFilter === "ALL"
              ? "New service requests assigned to your technician profile will appear here."
              : "There are no requests in this status right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleRequests.map((request) => {
            const customer = request.customerId || {};
            const isPending = request.status === "PENDING";
            const isUpdating = updatingId === request._id;

            return (
              <article key={request._id} className="card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Request #{request._id.slice(-6).toUpperCase()}
                      </span>
                      <RequestStatusBadge status={request.status} />
                    </div>
                    <h2 className="text-lg font-bold text-heading">
                      {customer.name || "Customer"}
                    </h2>
                    <p className="mt-1 text-sm text-secondary">
                      Submitted {formatCreatedAt(request.createdAt) || "recently"}
                    </p>
                  </div>

                  {isPending ? (
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(request._id, "ACCEPTED")}
                        disabled={Boolean(updatingId)}
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating ? "Saving..." : "Accept request"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(request._id, "REJECTED")}
                        disabled={Boolean(updatingId)}
                        className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating ? "Saving..." : "Reject"}
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                  <InfoItem label="Customer phone" value={customer.phone} />
                  <InfoItem label="Governorate" value={customer.area} />
                  <InfoItem label="Scheduled for" value={formatScheduledAt(request.scheduledAt)} />
                  <div className="sm:col-span-2 lg:col-span-3">
                    <InfoItem label="Service address" value={request.address} />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Problem description
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-heading">
                      {request.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
