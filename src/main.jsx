import React from "react";
import ReactDOM from "react-dom/client";   // ✅ this is missing
import App from "./App";
import { AuthProvider } from "@/context/AuthContext";
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
    </Router>
  </React.StrictMode>
);
