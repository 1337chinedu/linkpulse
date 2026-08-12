import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Info,
  Mail,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import "./Navigation.css";

export function Navigation() {
  const { token, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/about", label: "About", icon: Info },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Zap size={24} className="inline mr-2" />
          LinkPulse
        </Link>

        <ul className="navbar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="nav-underline"
                      className="nav-underline"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}

          {token ? (
            <>
              <li>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                  {isActive("/dashboard") && (
                    <motion.div
                      layoutId="nav-underline"
                      className="nav-underline"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className={`nav-link ${isActive("/settings") ? "active" : ""}`}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                  {isActive("/settings") && (
                    <motion.div
                      layoutId="nav-underline"
                      className="nav-underline"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </li>
              <li>
                <button className="btn-logout" onClick={logout}>
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="nav-link">
                  <LogIn size={18} />
                  <span>Log in</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn-primary">
                  <UserPlus size={18} />
                  <span>Sign up</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
