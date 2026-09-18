import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumb = () => {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((item) => item);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)]">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--btn-bg)] transition-colors duration-150"
      >
        <Home size={14} className="shrink-0" />
        <span>Home</span>
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
        const isLast = index === pathnames.length - 1;
        const formattedName = name.replace(/-/g, " ");

        return (
          <div key={routeTo} className="flex items-center gap-1.5">
            <ChevronRight size={13} className="text-[var(--text-muted)] shrink-0" />

            {isLast ? (
              <span className="font-semibold text-[var(--text-primary)] capitalize tracking-tight">
                {formattedName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-[var(--btn-bg)] capitalize text-[var(--text-secondary)] transition-colors duration-150"
              >
                {formattedName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;

