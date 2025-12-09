import React from "react";
import Sidebar from "./components/Sidebar";
import "./Shortcuts.css"; // Add styling for layout

export default function Shortcuts() {
  return (
    <div className="page-container">
      <Sidebar />

      <div className="page-main">
        <h1>Shortcuts</h1>
      </div>
    </div>
  );
}
