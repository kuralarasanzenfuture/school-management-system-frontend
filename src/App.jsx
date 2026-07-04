import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "./redux/auth/authSlice";
import AppInitializer from "./AppInitializer";

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
