import { useEffect, useState } from "react";
import { FaExpand, FaCompress } from "react-icons/fa";

const FullscreenButton = () => {
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
      title={fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      {fullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
    </button>
  );
};

export default FullscreenButton;
