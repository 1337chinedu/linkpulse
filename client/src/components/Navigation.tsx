import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navigation() {
  const { token, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          LinkPulse
        </Link>
        <ul className="navbar-menu">
          <li>
            <a href="#how-it-works">How it works</a>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          {token ? (
            <>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
              <li>
                <button className="link-button" onClick={logout}>
                  Log out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Log in</Link>
              </li>
              <li>
                <Link to="/register" className="btn-secondary">
                  Sign up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
