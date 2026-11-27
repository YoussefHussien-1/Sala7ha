import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import RequestStatusBadge from "../components/RequestStatusBadge";
import RequestStatusTracker from "../components/RequestStatusTracker";
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

export default function MyRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "CUSTOMER") {
      navigate("/technician/requests", { replace: true });
      return;
    }

    let cancelled = false;

    const loadRequests = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/requests/customer");
        if (!cancelled) {
          setRequests(response.data.requests || []);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Could not load your requests. Please try again."
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

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <p className="text-sm font-medium text-secondary">
          Loading your requests...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "CUSTOMER") return null;

  return (
    <section className="mx-auto max-w-6xl py-6 sm:py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Customer dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            My Requests
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
            Follow the progress of your home service requests and see the technician's response.
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
              ? "You haven't sent any requests yet"
              : `No ${activeFilter.toLowerCase()} requests`}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
            {activeFilter === "ALL"
              ? "When you book a technician, your request and its status will appear here."
              : "There are no requests in this status right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleRequests.map((request) => {
            const technicianProfile = request.technicianId || {};
            const technician = technicianProfile.userId || {};

            return (
              <article key={request._id} className="card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Request #{request._id.slice(-6).toUpperCase()}
                    </p>
                    <h2 className="text-lg font-bold text-heading">
                      {technicianProfile.specialty || "Home service"}
                    </h2>
                    <p className="mt-1 text-sm text-secondary">
                      Submitted {formatCreatedAt(request.createdAt) || "recently"}
                    </p>
                  </div>
                  <RequestStatusBadge status={request.status} />
                </div>

                <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Technician
                      </p>
                      <p className="mt-1 text-sm font-semibold text-heading">
                        {technician.name || "Technician details will be available soon"}
                      </p>
                      {technician.phone && (
                        <p className="mt-1 text-sm text-secondary">
                          {technician.phone}
                        </p>
                      )}
                      {technician.area && (
                        <p className="mt-1 text-sm text-secondary">
                          {technician.area}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Scheduled for
                      </p>
                      <p className="mt-1 text-sm font-semibold text-heading">
                        {formatScheduledAt(request.scheduledAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Service address
                      </p>
                      <p className="mt-1 text-sm leading-6 text-heading">
                        {request.address}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Problem description
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-heading">
                        {request.description}
                      </p>
                    </div>
                    <RequestStatusTracker status={request.status} />
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
