import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "./redux/auth/authSlice";
import AppInitializer from "./AppInitializer";
import { Toaster } from "react-hot-toast";

function App() {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, accessToken]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "var(--panel-bg, #ffffff)",
            color: "var(--text-primary, #1a1a2e)",
            border: "1px solid var(--divider, #eaedf8)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            borderRadius: "12px",
            fontSize: "13.5px",
            fontWeight: 500,
          },
        }}
      />
      <BrowserRouter>
        {/* <AppInitializer> */}
          <AppRoutes />
        {/* </AppInitializer> */}

        {/* <h1 className="text-3xl font-bold underline">Hello world!</h1> */}
      </BrowserRouter>
    </>
  );
}

export default App;
