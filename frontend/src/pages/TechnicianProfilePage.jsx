
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  area: "",
  specialty: "",
  experienceYears: 0,
  bio: "",
  isAvailable: true,
};

export default function TechnicianProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(initialProfile);
  const [formData, setFormData] = useState(initialProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch technician profile
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "TECHNICIAN") {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get("/technician/profile");

        setProfile(response.data.profile);
        setFormData(response.data.profile);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Save profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await api.put("/technician/profile", {
        phone: formData.phone,
        specialty: formData.specialty,
        experienceYears: Number(formData.experienceYears),
        bio: formData.bio,
      });

      setProfile(response.data.profile);
      setFormData(response.data.profile);

      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Toggle availability immediately
  const handleAvailabilityToggle = async () => {
    if (availabilityLoading) return;

    const previousStatus = profile.isAvailable;
    const newStatus = !previousStatus;

    setAvailabilityLoading(true);
    setError("");
    setSuccess("");

    // Optimistic UI update
    setProfile((previous) => ({
      ...previous,
      isAvailable: newStatus,
    }));

    try {
      const response = await api.patch(
        "/technician/availability",
        { isAvailable: newStatus }
      );

      setProfile((previous) => ({
        ...previous,
        isAvailable: response.data.isAvailable,
      }));

      setSuccess("Availability status updated.");
    } catch (err) {
      // Restore previous status if request fails
      setProfile((previous) => ({
        ...previous,
        isAvailable: previousStatus,
      }));

      setError(
        err.response?.data?.message ||
          "Failed to update availability."
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  if (!user || user.role !== "TECHNICIAN") {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-primary">
          TECHNICIAN ACCOUNT
        </p>

        <h1 className="text-3xl font-bold">
          My Professional Profile
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your professional information and availability.
        </p>
      </div>

      {/* Profile Summary */}
      <section className="card mb-6 p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">
              {profile.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {profile.email}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {profile.area}
            </p>
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                profile.isAvailable
                  ? "bg-green-50 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  profile.isAvailable
                    ? "bg-green-500"
                    : "bg-slate-400"
                }`}
              />

              {profile.isAvailable ? "Available" : "Busy"}
            </span>
          </div>
        </div>
      </section>

      {/* Availability */}
      <section className="card mb-6 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">
              Availability Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Let customers know whether you are available for new requests.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAvailabilityToggle}
            disabled={availabilityLoading}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              profile.isAvailable
                ? "bg-slate-600 hover:bg-slate-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {availabilityLoading
              ? "Updating..."
              : profile.isAvailable
                ? "Set as Busy"
                : "Set as Available"}
          </button>
        </div>
      </section>

      {/* Feedback */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Edit Profile */}
      <section className="card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            Professional Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Keep your information up to date.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone */}
          <div>
            <label className="label" htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              placeholder="01xxxxxxxxx"
              required
            />
          </div>

          {/* Specialty */}
          <div>
            <label className="label" htmlFor="specialty">
              Specialty
            </label>

            <input
              id="specialty"
              name="specialty"
              type="text"
              value={formData.specialty}
              onChange={handleChange}
              className="input"
              placeholder="e.g. Electrician, Plumber"
              required
            />
          </div>

          {/* Experience */}
          <div>
            <label className="label" htmlFor="experienceYears">
              Years of Experience
            </label>

            <input
              id="experienceYears"
              name="experienceYears"
              type="number"
              min="0"
              step="1"
              value={formData.experienceYears}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="label" htmlFor="bio">
              About Me
            </label>

            <textarea
              id="bio"
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              className="input resize-none"
              placeholder="Tell customers about your experience and services..."
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary min-w-36"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
