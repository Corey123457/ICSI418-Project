import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState("shortcuts");

    const tripItems = [
        { id: 1, title: "Convenience stores", subtitle: "Get a quick snack" },
        { id: 2, title: "Local park", subtitle: "For staying fit" },
        { id: 3, title: "List item", subtitle: "Supporting line text lorem ipsum dolor sit amet, consectetur." },
        { id: 4, title: "List item", subtitle: "Supporting line text lorem ipsum dolor sit amet, consectetur." },
        { id: 5, title: "List item", subtitle: "Supporting line text lorem ipsum dolor sit amet, consectetur." },
    ];

    const historyItems = [
        { id: 1, title: "Convenience stores", subtitle: "Get a quick snack" },
        { id: 2, title: "Local park", subtitle: "For staying fit" },
        { id: 3, title: "List item", subtitle: "Supporting line text lorem ipsum dolor sit amet, consectetur." },
    ];

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-icon edit-icon">✎</div>
                <nav className="sidebar-nav">
                    <button 
                        className={`nav-icon ${activeNav === "shortcuts" ? "active" : ""}`}
                        onClick={() => setActiveNav("shortcuts")}
                        title="Shortcuts"
                    >
                        ⭐
                    </button>
                    <button 
                        className={`nav-icon ${activeNav === "groups" ? "active" : ""}`}
                        onClick={() => setActiveNav("groups")}
                        title="Groups"
                    >
                        👥
                    </button>
                    <button 
                        className={`nav-icon ${activeNav === "preferences" ? "active" : ""}`}
                        onClick={() => setActiveNav("preferences")}
                        title="Preferences"
                    >
                        ⚙️
                    </button>
                </nav>
            </aside>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                    <h1>Dashboard</h1>
                    <div className="header-icons">
                        <button className="icon-btn">🗑️</button>
                        <button className="icon-btn">📅</button>
                        <button className="icon-btn">⋮</button>
                    </div>
                </div>

                <section className="trips-section">
                    <h2 className="section-title">My Trips <span className="arrow">→</span></h2>
                    <div className="trips-list">
                        {tripItems.map((item) => (
                            <div key={item.id} className="list-item">
                                <div className="item-icon">📍</div>
                                <div className="item-content">
                                    <h3 className="item-title">{item.title}</h3>
                                    <p className="item-subtitle">{item.subtitle}</p>
                                </div>
                                <button className="item-menu">⋮</button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="history-section">
                    <h2 className="section-title">History <span className="arrow">→</span></h2>
                    <div className="history-list">
                        {historyItems.map((item) => (
                            <div key={item.id} className="list-item">
                                <div className="item-icon">📍</div>
                                <div className="item-content">
                                    <h3 className="item-title">{item.title}</h3>
                                    <p className="item-subtitle">{item.subtitle}</p>
                                </div>
                                <button className="item-menu">⋮</button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
