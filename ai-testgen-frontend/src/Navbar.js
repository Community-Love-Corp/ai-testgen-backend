import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Listens for URL path changes
  
  // Track the token in the component state
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Automatically re-check the token status every time the user navigates pages
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">🧪 AI TestGen</Link>
      </div>
      
      <div className="nav-links">
        {/* If token does not exist, show public links */}
        {!token ? (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/register" className="nav-item nav-btn-primary">Register</Link>
          </>
        ) : (
          /* If token exists, show authenticated links */
          <>
            <Link to="/" className="nav-item">Generate</Link>
            <Link to="/history" className="nav-item">History</Link>
            <button onClick={handleLogout} className="nav-item logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
