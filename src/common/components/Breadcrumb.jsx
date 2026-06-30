import { Link, useLocation } from "react-router-dom";
import { FaChevronRight, FaHome } from "react-icons/fa";

const Breadcrumb = () => {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((item) => item);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-blue-600"
      >
        <FaHome />
        Home
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = "/" + pathnames.slice(0, index + 1).join("/");

        const isLast = index === pathnames.length - 1;

        return (
          <div key={routeTo} className="flex items-center gap-2">
            <FaChevronRight className="text-xs" />

            {isLast ? (
              <span className="font-semibold text-gray-800 capitalize">
                {name.replace("-", " ")}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-blue-600 capitalize">
                {name.replace("-", " ")}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
