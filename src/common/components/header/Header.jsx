import { useEffect, useRef, useState } from "react";
import {
  FaMoon,
  FaSun,
  FaBell,
  FaExpand,
  FaCompress,
  FaUserCircle,
  FaCog,
  FaKey,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import Breadcrumb from "../Breadcrumb";
import ThemeToggle from "../../../features/auth/components/ThemeToggle";
import "./header.css";
import FullscreenButton from "../FullscreenButton";

const Header = () => {
  // const [dark, setDark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen Error:", err);
    }
  };

  // const toggleDark = () => {
  //   setDark(!dark);
  //   document.documentElement.classList.toggle("dark");
  // };

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

  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header h-16 border-b shadow-sm flex items-center justify-between px-6">
      {/* Left */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white"></h2>
        <Breadcrumb />
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          className="hidden lg:block w-64 px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Dark Mode */}
        <button
          onClick={() => setDark(!dark)}
          className="text-xl hover:text-blue-600 cursor-pointer transition"
        >
          {dark ? <FaSun /> : <FaMoon />}
        </button>
        {/* <ThemeToggle iconOnly /> */}

        {/* Notification */}
        <div className="relative cursor-pointer">
          <FaBell size={20} />

          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            3
          </span>
        </div>

        {/* Fullscreen */}
        {/* <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
        </button> */}
        <FullscreenButton />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3"
          >
            <img
              src="https://i.pravatar.cc/150?img=8"
              alt=""
              className="w-10 h-10 rounded-full"
            />

            <div className="hidden md:block text-left">
              <h4 className="text-sm text-gray-700 dark:text-white">
                Kuralarasan
              </h4>

              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
              <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700">
                <FaUser />
                My Profile
              </button>

              <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700">
                <FaCog />
                Settings
              </button>

              <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700">
                <FaKey />
                Change Password
              </button>

              <hr />

              <button className="flex items-center gap-3 text-red-500 w-full px-4 py-3 hover:bg-red-50">
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
