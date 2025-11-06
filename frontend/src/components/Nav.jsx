import React from "react";
import { NavLink } from "react-router-dom";

export default function Nav() {
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <div className="brand">VitalVibe</div>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => "nav-link " + (isActive ? "active" : "")}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => "nav-link " + (isActive ? "active" : "")}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => "nav-link " + (isActive ? "active" : "")}>
            Contact
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
