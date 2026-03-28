import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiMenu, FiShield, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/get-quote", label: "Quote" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/policy", label: "Policy" },
  { to: "/claims", label: "Claims" },
  { to: "/admin", label: "Admin" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-300 text-slate-950 shadow-lg shadow-teal-500/20">
            <FiShield className="text-xl" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-white">GigShield</p>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-300/80">Parametric cover for riders</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? "text-teal-300" : "text-slate-300 hover:text-white"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                {user?.name}
              </div>
              <button onClick={handleLogout} className="gs-btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="gs-btn-secondary">
                Login
              </NavLink>
              <NavLink to="/register" className="gs-btn-primary">
                Register
              </NavLink>
            </>
          )}
        </div>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 md:hidden"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-slate-950/95 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="gs-btn-secondary w-full">
                Logout
              </button>
            ) : (
              <>
                <NavLink to="/login" className="gs-btn-secondary text-center" onClick={() => setOpen(false)}>
                  Login
                </NavLink>
                <NavLink to="/register" className="gs-btn-primary text-center" onClick={() => setOpen(false)}>
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
