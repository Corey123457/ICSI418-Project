import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: "20px" }}>
            <h1>Dashboard</h1>

            <button onClick={() => navigate("/ChooseP")}>
                Preferences
            </button>

            <button onClick={() => navigate()}>
                (Page)
            </button>

            <button onClick={() => navigate()}>
                (Page)
            </button>

            <button onClick={() => navigate()}>
                (Page)
            </button>

            <button onClick={() => navigate()}>
                (Page)
            </button>

            <button onClick={() => navigate()}>
                (Page)
            </button>
        </div>
    );
};

export default Dashboard;
