import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { OverlayApp } from "./overlay/OverlayApp";
import "./App.css";

const root = ReactDOM.createRoot(
  document.getElementById("root")!
);

const params = new URLSearchParams(window.location.search);
const view = params.get("view");

root.render(
  <React.StrictMode>
    {view === "overlay" ? <OverlayApp /> : <App />}
  </React.StrictMode>
);
