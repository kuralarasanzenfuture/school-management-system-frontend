import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = ({ iconOnly = false }) => {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      type="button"
      className="theme-btn"
      onClick={() => setDark((prev) => !prev)}
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {dark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
      {!iconOnly && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
    </button>
  );
};

export default ThemeToggle;
