import axios from 'axios'
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const handleTeam = (event, pref, time) => {
    axios.post('http://localhost:9000/choosePref', { pref, time })
        .catch((err) => alert('Error in Signing Up'));
};

const Signup = () => {

    const [pref, setPref] = useState([]);
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const combinedTime = `${hours}:${minutes}`;

    const weatherOptions = ["Sunny", "Cloudy", "Rainy", "Snowy"];

    const togglePref = (weather) => {
        setPref(prev => {
            if (prev.includes(weather)) {
                return prev.filter(p => p !== weather);
            }
            return [...prev, weather];
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "80px",
                    marginTop: "100px"
                }}
            >

                <div style={{ textAlign: "left" }}>
                    <label><strong>Weather:</strong></label>
                    <div>
                        {weatherOptions.map((weather) => (
                            <label key={weather} style={{ display: "block", marginTop: "6px" }}>
                                <input
                                    type="checkbox"
                                    checked={pref.includes(weather)}
                                    onChange={() => togglePref(weather)}
                                />
                                {weather}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: "left" }}>
                    <label><strong>Time of Day:</strong></label>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "6px" }}>
                        <input
                            type="text"
                            placeholder="HH"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            style={{ width: "50px", textAlign: "center" }}
                        />
                        <span style={{ margin: "0 8px" }}>:</span>
                        <input
                            type="text"
                            placeholder="MM"
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            style={{ width: "50px", textAlign: "center" }}
                        />
                    </div>
                </div>

            </form>

            <div
                style={{
                    width: "300px",
                    margin: "40px auto 0 auto",
                    position: "relative",
                    height: "60px"
                }}
            >
                <button
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        left: "20px",
                        backgroundColor: "#ccc",
                        color: "black",
                        border: "none",
                        borderRadius: "6px",
                        padding: "10px 20px",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                    onClick={() => navigate("/dashboard")}
                >
                    Cancel
                </button>

            </div>

            <button
                onClick={(event) => {
                    handleTeam(event, pref, combinedTime); // keep original submission
                    navigate("/Dashboard"); // navigate to dashboard immediately after
                }}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    backgroundColor: "#007BFF",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: "16px"
                }}
            >
                Submit
            </button>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
                |<a href="/Login">Login</a>|
                <a href="/Signup">Signup</a>|
            </div>
        </>
    );
};

export default Signup;
