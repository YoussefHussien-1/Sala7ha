import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { EGYPT_GOVERNORATES } from "../constants/egyptGovernorates";

// Normalize Egyptian phone numbers
const normalizeEgyptianPhone = (value) => {
  const digits = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };

  let phone = String(value).replace(/[٠-٩۰-۹]/g, (digit) => digits[digit]);

  phone = phone.replace(/[\s()-]/g, "");

  // Local Egyptian number
  if (/^01[0125]\d{8}$/.test(phone)) {
    return phone;
  }

  // International number
  const international = phone.match(
    /^(?:\+20|0020)(1[0125]\d{8})$/
  );

  return international ? `0${international[1]}` : null;
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    area: "",
    role: "CUSTOMER",
    specialty: "General",
    experienceYears: "0",
    bio: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate phone
    const normalizedPhone = normalizeEgyptianPhone(formData.phone);

    if (!normalizedPhone) {
      setError("رقم الهاتف غير صحيح. أدخل رقم موبايل مصري صحيح.");
      return;
    }

    // Validate governorate
    const selectedGovernorate = EGYPT_GOVERNORATES.find(
      (item) => item.value === formData.area
    );

    if (!selectedGovernorate) {
      setError("من فضلك اختار محافظة صحيحة.");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: normalizedPhone,
        area: selectedGovernorate.value,
        role: formData.role,
      };

      if (formData.role === "TECHNICIAN") {
        userData.specialty = formData.specialty;
        userData.experienceYears = Number(formData.experienceYears);
        userData.bio = formData.bio.trim();
      }

      await register(userData);

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-6xl items-center justify-center px-4 py-10">
      <div className="card w-full max-w-xl p-8">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-heading">
            Create Account
          </h1>

          <p className="mt-2 text-secondary">
            Join Sala7ha and get started
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-heading">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
              className="w-full rounded-lg border border-line px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-heading">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-line px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-heading">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-lg border border-line px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-medium text-heading">
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01012345678"
              inputMode="tel"
              autoComplete="tel"
              required
              className="w-full rounded-lg border border-line px-4 py-3 outline-none focus:border-primary"
            />

            <p className="mt-1 text-xs text-secondary">
              Egyptian mobile numbers only: 010, 011, 012, 015.
              International format +20 is also accepted.
            </p>
          </div>

          {/* Governorate */}
          <div>
            <label className="mb-2 block text-sm font-medium text-heading">
              Governorate / المحافظة
            </label>

            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-line bg-white px-4 py-3 outline-none focus:border-primary"
            >
              <option value="">
                Select your governorate / اختر محافظتك
              </option>

              {EGYPT_GOVERNORATES.map((governorate) => (
                <option
                  key={governorate.value}
                  value={governorate.value}
                >
                  {governorate.label}
                </option>
              ))}
            </select>
          </div>

          {/* Account Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-heading">
              Account Type
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-line bg-white px-4 py-3 outline-none focus:border-primary"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="TECHNICIAN">Technician</option>
            </select>
          </div>

          {/* Technician Information */}
          {formData.role === "TECHNICIAN" && (
            <div className="space-y-5 rounded-xl border border-line p-5">

              <h2 className="text-lg font-semibold text-heading">
                Technician Information
              </h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-heading">
                  Specialty
                </label>

                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-line bg-white px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="General">General</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="AC">AC</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-heading">
                  Experience Years
                </label>

                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                  className="w-full rounded-lg border border-line px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-heading">
                  About You
                </label>

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell customers about your experience..."
                  rows="3"
                  className="w-full resize-none rounded-lg border border-line px-4 py-3 outline-none focus:border-primary"
                />
              </div>

            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}