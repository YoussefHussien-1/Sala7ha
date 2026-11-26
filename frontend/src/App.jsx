import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TechnicianProfilePage from "./pages/TechnicianProfilePage";

// Home Page
function HomePage() {
  return (
    <section className="card p-8">
      <h1 className="text-3xl font-bold text-heading">
        Welcome to Home Services
      </h1>

      <p className="mt-3 text-secondary">
        Find trusted professionals for your home services.
      </p>
    </section>
  );
}

// Placeholder Pages
function PlaceholderPage({ title, description }) {
  return (
    <section className="card p-8">
      <h1 className="text-2xl font-bold text-heading">
        {title}
      </h1>

      <p className="mt-3 text-secondary">
        {description}
      </p>

      <span className="mt-5 inline-block rounded-full bg-primary-soft px-3 py-1 text-sm text-primary">
        Coming Soon
      </span>
    </section>
  );
}

// Main App
export default function App() {
  return (
    <div className="min-h-screen bg-page">

      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">

        <Routes>

          <Route path="/" element={<HomePage />} />

          <Route
            path="/technicians"
            element={
              <PlaceholderPage
                title="Find Technicians"
                description="Find the right professional for your needs."
              />
            }
          />

          <Route
            path="/technician/profile"
            element={<TechnicianProfilePage />}
          />

          <Route
            path="/requests"
            element={
              <PlaceholderPage
                title="My Requests"
                description="Track your service requests."
              />
            }
          />

          {/* Authentication Pages */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <PlaceholderPage
                title="404"
                description="Page not found."
              />
            }
          />

        </Routes>

      </main>

    </div>
  );
}