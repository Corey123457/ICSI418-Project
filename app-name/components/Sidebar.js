import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <button className="icon-btn" onClick={() => navigate("/Dashboard")}>
        <span className="material-icons">menu</span>
      </button>

      <button className="nav-btn" onClick={() => navigate("/CreateTrip")}>
        <span className="material-icons">edit</span>
        <span>Create Trip</span>
      </button>

      <button className="nav-btn" onClick={() => navigate("/Groups")}>
        <span className="material-icons">group</span>
        <span>Groups</span>
      </button>

      <button className="nav-btn" onClick={() => navigate("/Preferences")}>
        <span className="material-icons">tune</span>
        <span>Preferences</span>
      </button>

    
       <button className="nav-btn" onClick={() => navigate("/Itinerary")}>
        <span className="material-icons">event</span>
        <span>Itinerary</span>
      </button> 

      <button className="nav-btn" onClick={() => navigate("/Settings")}>
        <span className="material-icons">settings</span>
        <span>Settings</span>
      </button>
    </div>
  );
};

export default Sidebar;
