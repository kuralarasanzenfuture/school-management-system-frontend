// import { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   Sun,
//   Moon,
//   Bell,
//   Maximize2,
//   Minimize2,
//   User,
//   Settings,
//   KeyRound,
//   LogOut,
//   ChevronDown,
//   Search,
// } from "lucide-react";
// import {
//   logoutUser,
//   clearAuth,
//   fetchCurrentUser,
// } from "../../../redux/auth/authSlice";
// import Breadcrumb from "../Breadcrumb";
// import "./header.css";

// const Header = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // Single selector — no need for the duplicate `user`/`authUser` calls
//   const {
//     user: authUser,
//     loading,
//     accessToken,
//   } = useSelector((state) => state.auth);

//   const [isDark, setIsDark] = useState(
//     () => localStorage.getItem("theme") === "dark",
//   );
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [notifCount] = useState(3);

//   const profileRef = useRef(null);

//   useEffect(() => {
//     if (accessToken && !authUser) {
//       dispatch(fetchCurrentUser());
//     }
//   }, [dispatch, accessToken, authUser]);

//   useEffect(() => {
//     document.documentElement.setAttribute(
//       "data-theme",
//       isDark ? "dark" : "light",
//     );
//     localStorage.setItem("theme", isDark ? "dark" : "light");
//   }, [isDark]);

//   useEffect(() => {
//     const handleOutsideClick = (clickEvent) => {
//       if (
//         profileRef.current &&
//         !profileRef.current.contains(clickEvent.target)
//       ) {
//         setShowMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleOutsideClick);
//     return () => document.removeEventListener("mousedown", handleOutsideClick);
//   }, []);

//   const toggleFullscreen = async () => {
//     try {
//       if (!document.fullscreenElement) {
//         await document.documentElement.requestFullscreen();
//         setIsFullscreen(true);
//       } else {
//         await document.exitFullscreen();
//         setIsFullscreen(false);
//       }
//     } catch (fullscreenError) {
//       console.error("Fullscreen error:", fullscreenError);
//     }
//   };

//   const handleLogout = async () => {
//     setLoggingOut(true);
//     try {
//       await dispatch(logoutUser()).unwrap();
//     } catch {
//       dispatch(clearAuth());
//     } finally {
//       setLoggingOut(false);
//       setShowMenu(false);
//       navigate("/login", { replace: true });
//     }
//   };

//   // 👇 conditional render goes here, AFTER every hook has already run
//   if (loading && !authUser) {
//     return null; // or your loader
//   }

//   const displayName = authUser?.name ?? authUser?.username ?? "Admin";
//   const displayEmail = authUser?.email ?? "";
//   const displayRole = authUser?.roles ?? "Super Admin";
//   const avatarUrl =
//     authUser?.avatar ??
//     `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=80`;

//   return (
//     <header className="hd-header flex items-center justify-between px-5 sm:px-6">
//       {/* ── Left: breadcrumb ── */}
//       <div className="flex items-center min-w-0">
//         <Breadcrumb />
//       </div>

//       {/* ── Right: actions ── */}
//       <div className="flex items-center gap-2">
//         {/* Search — hidden on small screens */}
//         <div className="hd-search-wrap hidden lg:flex items-center gap-2 rounded-lg px-3 py-2 w-56">
//           <Search size={14} className="hd-search-icon shrink-0" />
//           <input
//             className="hd-search-input text-[13.5px]"
//             placeholder="Search…"
//           />
//         </div>

//         {/* Dark-mode toggle */}
//         <button
//           onClick={() => setIsDark((prevDark) => !prevDark)}
//           className="hd-theme-btn w-9 h-9 rounded-lg flex items-center justify-center"
//           title={isDark ? "Switch to light mode" : "Switch to dark mode"}
//         >
//           {isDark ? <Sun size={17} /> : <Moon size={17} />}
//         </button>

//         {/* Notifications */}
//         <button className="hd-icon-btn relative w-9 h-9 rounded-lg flex items-center justify-center">
//           <Bell size={17} />
//           {notifCount > 0 && (
//             <span className="hd-notif-badge absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center">
//               {notifCount}
//             </span>
//           )}
//         </button>

//         {/* Fullscreen */}
//         <button
//           onClick={toggleFullscreen}
//           className="hd-icon-btn w-9 h-9 rounded-lg items-center justify-center hidden sm:flex"
//           title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
//         >
//           {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
//         </button>

//         {/* Vertical divider */}
//         <div
//           className="w-px h-6 mx-1"
//           style={{ background: "var(--divider)" }}
//         />

//         {/* Profile trigger */}
//         <div ref={profileRef} className="relative">
//           <button
//             onClick={() => setShowMenu((prev) => !prev)}
//             className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hd-icon-btn"
//           >
//             <img
//               src={avatarUrl}
//               alt={displayName}
//               className="hd-avatar-ring w-8 h-8 rounded-full object-cover"
//             />
//             <div className="hidden md:block text-left">
//               <p className="hd-profile-name text-[13px] font-semibold leading-tight">
//                 {displayName}
//               </p>
//               <p className="hd-profile-role text-[11px] leading-tight">
//                 {displayRole}
//               </p>
//             </div>
//             <ChevronDown
//               size={14}
//               className="hd-profile-role hidden md:block transition-transform duration-200"
//               style={{
//                 transform: showMenu ? "rotate(180deg)" : "rotate(0deg)",
//               }}
//             />
//           </button>

//           {/* Dropdown */}
//           {showMenu && (
//             <div className="hd-dropdown absolute right-0 mt-2 w-60 rounded-xl overflow-hidden z-50">
//               {/* User info header */}
//               <div className="hd-dropdown-header flex items-center gap-3 px-4 py-3.5">
//                 <img
//                   src={avatarUrl}
//                   alt={displayName}
//                   className="w-10 h-10 rounded-full object-cover shrink-0"
//                 />
//                 <div className="min-w-0">
//                   <p className="hd-dropdown-name text-[13.5px] font-semibold truncate">
//                     {displayName}
//                   </p>
//                   <p className="hd-dropdown-email text-[11.5px] truncate">
//                     {displayEmail}
//                   </p>
//                 </div>
//               </div>

//               {/* Menu items */}
//               <div className="py-1">
//                 <button
//                   onClick={() => setShowMenu(false)}
//                   className="hd-menu-item flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium"
//                 >
//                   <User size={15} /> My Profile
//                 </button>
//                 <button
//                   onClick={() => setShowMenu(false)}
//                   className="hd-menu-item flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium"
//                 >
//                   <Settings size={15} /> Settings
//                 </button>
//                 <button
//                   onClick={() => setShowMenu(false)}
//                   className="hd-menu-item flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium"
//                 >
//                   <KeyRound size={15} /> Change Password
//                 </button>
//               </div>

//               <div className="hd-menu-divider h-px mx-3" />

//               {/* Logout */}
//               <div className="py-1">
//                 <button
//                   onClick={handleLogout}
//                   disabled={loggingOut}
//                   className="hd-menu-logout flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60"
//                 >
//                   <LogOut size={15} />
//                   {loggingOut ? "Logging out…" : "Logout"}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Bell,
  Maximize2,
  Minimize2,
  User,
  Settings,
  KeyRound,
  LogOut,
  ChevronDown,
  Search,
} from "lucide-react";
import {
  logoutUser,
  clearAuth,
  fetchCurrentUser,
} from "../../../redux/auth/authSlice";
import Breadcrumb from "../Breadcrumb";
import "./header.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    user: authUser,
    loading,
    accessToken,
  } = useSelector((state) => state.auth);

  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notifCount] = useState(3);

  const profileRef = useRef(null);

  // useEffect(() => {
  //   console.log("Effect:", { accessToken, authUser });

  //   if (accessToken && !authUser) {
  //     console.log("Dispatching fetchCurrentUser");
  //     dispatch(fetchCurrentUser());
  //   }
  // }, [dispatch, accessToken, authUser]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const handleOutsideClick = (clickEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(clickEvent.target)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (fullscreenError) {
      console.error("Fullscreen error:", fullscreenError);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      dispatch(clearAuth());
    } finally {
      setLoggingOut(false);
      setShowMenu(false);
      navigate("/login", { replace: true });
    }
  };

  // Block render for the entire "we have a token but no user yet" window,
  // not just while the fetchCurrentUser thunk happens to be pending.
  const isBootstrapping = Boolean(accessToken) && !authUser;

  if (loading || isBootstrapping) {
    return null; // or a small loader/skeleton
  }

  const displayName = authUser?.name ?? authUser?.username ?? "Admin";
  const displayEmail = authUser?.email ?? "";

  const roles = Array.isArray(authUser?.roles)
    ? authUser.roles
    : authUser?.roles
      ? [authUser.roles]
      : ["Super Admin"];
  const primaryRole = roles[0];
  const extraRolesCount = roles.length - 1;
  const allRolesLabel = roles.join(", ");

  const avatarUrl =
    authUser?.avatar ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=80`;

  return (
    <header className="hd-header flex items-center justify-between px-5 sm:px-6">
      {/* ── Left: breadcrumb ── */}
      <div className="flex items-center min-w-0">
        <Breadcrumb />
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-2">
        {/* Search — hidden on small screens */}
        <div className="hd-search-wrap hidden lg:flex items-center gap-2 rounded-lg px-3 py-2 w-56">
          <Search size={14} className="hd-search-icon shrink-0" />
          <input
            className="hd-search-input text-[13.5px]"
            placeholder="Search…"
          />
        </div>

        {/* Dark-mode toggle */}
        <button
          onClick={() => setIsDark((prevDark) => !prevDark)}
          className="hd-theme-btn w-9 h-9 rounded-lg flex items-center justify-center"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <button className="hd-icon-btn relative w-9 h-9 rounded-lg flex items-center justify-center">
          <Bell size={17} />
          {notifCount > 0 && (
            <span className="hd-notif-badge absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="hd-icon-btn w-9 h-9 rounded-lg items-center justify-center hidden sm:flex"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>

        {/* Vertical divider */}
        <div
          className="w-px h-6 mx-1"
          style={{ background: "var(--divider)" }}
        />

        {/* Profile trigger */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hd-icon-btn"
          >
            <img
              src={avatarUrl}
              alt={displayName}
              className="hd-avatar-ring w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="hd-profile-name text-[13px] font-semibold leading-tight">
                {displayName}
              </p>
              <p
                className="hd-profile-role text-[11px] leading-tight"
                title={allRolesLabel}
              >
                {primaryRole}
                {extraRolesCount > 0 && ` +${extraRolesCount}`}
              </p>
            </div>
            <ChevronDown
              size={14}
              className="hd-profile-role hidden md:block transition-transform duration-200"
              style={{
                transform: showMenu ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {/* Dropdown */}
          {showMenu && (
            <div className="hd-dropdown absolute right-0 mt-2 w-60 rounded-xl overflow-hidden z-50">
              {/* User info header */}
              <div className="hd-dropdown-header flex items-center gap-3 px-4 py-3.5">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="hd-dropdown-name text-[13.5px] font-semibold truncate">
                    {displayName}
                  </p>
                  <p className="hd-dropdown-email text-[11.5px] truncate">
                    {displayEmail}
                  </p>
                  <p
                    className="hd-dropdown-role text-[11px] truncate"
                    title={allRolesLabel}
                  >
                    {primaryRole}
                    {extraRolesCount > 0 && ` +${extraRolesCount} more`}
                  </p>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => setShowMenu(false)}
                  className="hd-menu-item flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium"
                >
                  <User size={15} /> My Profile
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="hd-menu-item flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium"
                >
                  <Settings size={15} /> Settings
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="hd-menu-item flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium"
                >
                  <KeyRound size={15} /> Change Password
                </button>
              </div>

              <div className="hd-menu-divider h-px mx-3" />

              {/* Logout */}
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="hd-menu-logout flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60"
                >
                  <LogOut size={15} />
                  {loggingOut ? "Logging out…" : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
