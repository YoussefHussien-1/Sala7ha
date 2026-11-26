import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive
      ? "text-primary"
      : "text-secondary hover:text-heading"
  }`;

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
            </svg>
          </span>

          <span className="text-lg font-bold text-heading">
            Sala7ha
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/technicians" className={linkClass}>
            Find Technicians
          </NavLink>

          <NavLink to="/requests" className={linkClass}>
            My Requests
          </NavLink>
        </div>

        {/* Authentication Section */}
        <div className="flex items-center gap-3">

          {loading ? (
            <span className="text-sm text-secondary">
              Loading...
            </span>
          ) : isAuthenticated ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-heading">
                  {user.name}
                </p>

                <p className="text-xs text-secondary">
                  {user.role}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>

              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </>
          )}

        </div>
      </nav>
    </header>
  );
}