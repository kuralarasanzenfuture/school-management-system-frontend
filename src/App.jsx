import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {

  return (
    <>
      <BrowserRouter>
        <AppRoutes />
        {/* <h1 className="text-3xl font-bold underline">Hello world!</h1> */}
      </BrowserRouter>
    </>
  );
}

export default App;
