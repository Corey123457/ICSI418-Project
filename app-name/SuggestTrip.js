import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import "./SuggestedTrips.css";

export default function SuggestedTrips() {
  const [prefs, setPrefs] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const cities = [
    { name: "New York", lat: 40.7128, lon: -74.0060 },
    { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
    { name: "Miami", lat: 25.7617, lon: -80.1918 },
    { name: "Seattle", lat: 47.6062, lon: -122.3321 },
    { name: "Denver", lat: 39.7392, lon: -104.9903 },
    { name: "Chicago", lat: 41.8781, lon: -87.6298 },
    { name: "Phoenix", lat: 33.4484, lon: -112.0740 },
    { name: "San Diego", lat: 32.7157, lon: -117.1611 },
    { name: "San Francisco", lat: 37.7749, lon: -122.4194 }
  ];

  // Convert travel dates → month #
  const getMonthFromRange = () => {
    if (!prefs?.prefStart) return null;
    return new Date(prefs.prefStart).getMonth() + 1;
  };

  useEffect(() => {
    const stored = localStorage.getItem("weatherPreferences");
    if (!stored) return;

    setPrefs(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!prefs) return;

    const month = getMonthFromRange();
    if (!month) return;

    async function calculateRecommendations() {
      let results = [];

      for (const city of cities) {
        const url = `https://climate-api.open-meteo.com/v1/climate?latitude=${city.lat}&longitude=${city.lon}&month=${month}&temperature_mean=true&precipitation=true`;

        const res = await fetch(url);
        const data = await res.json();

        const avgTempC = data.temperature_mean?.[0];
        const avgTempF = avgTempC * 9/5 + 32;

        const rain = data.precipitation?.[0];

        // Check temperature preference
        const tempOK = 
          avgTempF >= prefs.tempRange[0] &&
          avgTempF <= prefs.tempRange[1];

        // Check weather type preference
        let weatherOK = true;
        if (prefs.weatherTypes.includes("Sunny")) {
          weatherOK = rain < 60; // low rainfall
        } else if (prefs.weatherTypes.includes("Rain")) {
          weatherOK = rain > 100;
        } else if (prefs.weatherTypes.includes("Snow")) {
          weatherOK = avgTempF < 32;
        }

        if (tempOK && weatherOK) {
          results.push({
            city: city.name,
            temp: Math.round(avgTempF),
            rain,
            reason: `Matches your ${prefs.weatherTypes.join(", ")} preference`
          });
        }
      }

      setRecommendations(results);
    }

    calculateRecommendations();
  }, [prefs]);

  return (
    <div className="suggested-container">
      <Sidebar />

      <div className="suggested-main">
        <h1>Your Recommended Destinations</h1>

        {!prefs && <p>Set your preferences first.</p>}

        {recommendations.length === 0 && prefs && (
          <p>No destinations match your selected weather profile.</p>
        )}

        <div className="recommend-grid">
          {recommendations.map((rec, index) => (
            <div key={index} className="rec-card">
              <h2>{rec.city}</h2>
              <p>Avg Temp: {rec.temp}°F</p>
              <p>Rainfall: {Math.round(rec.rain)}mm</p>
              <p className="reason">{rec.reason}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
