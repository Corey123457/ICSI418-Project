// src/Preferences.js
import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import "./Preferences.css";


const cityCandidates = [
  { name: "Birmingham, AL",       lat: 33.52,   lon: -86.81 },
  { name: "Anchorage, AK",        lat: 61.22,   lon: -149.90 },
  { name: "Phoenix, AZ",          lat: 33.45,   lon: -112.07 },
  { name: "Little Rock, AR",      lat: 34.75,   lon: -92.28 },
  { name: "Los Angeles, CA",      lat: 34.05,   lon: -118.24 },
  { name: "Denver, CO",           lat: 39.74,   lon: -104.99 },
  { name: "Bridgeport, CT",       lat: 41.18,   lon: -73.19 },
  { name: "Wilmington, DE",       lat: 39.74,   lon: -75.55 },
  { name: "Jacksonville, FL",     lat: 30.33,   lon: -81.66 },
  { name: "Atlanta, GA",          lat: 33.75,   lon: -84.39 },
  { name: "Honolulu, HI",         lat: 21.31,   lon: -157.86 },
  { name: "Boise, ID",            lat: 43.62,   lon: -116.20 },
  { name: "Chicago, IL",          lat: 41.88,   lon: -87.63 },
  { name: "Indianapolis, IN",     lat: 39.77,   lon: -86.16 },
  { name: "Des Moines, IA",       lat: 41.58,   lon: -93.62 },
  { name: "Wichita, KS",          lat: 37.69,   lon: -97.34 },
  { name: "Louisville, KY",       lat: 38.25,   lon: -85.76 },
  { name: "New Orleans, LA",      lat: 29.95,   lon: -90.07 },
  { name: "Portland, ME",         lat: 43.66,   lon: -70.25 },
  { name: "Baltimore, MD",        lat: 39.29,   lon: -76.61 },
  { name: "Boston, MA",           lat: 42.36,   lon: -71.06 },
  { name: "Detroit, MI",          lat: 42.33,   lon: -83.05 },
  { name: "Minneapolis, MN",      lat: 44.98,   lon: -93.27 },
  { name: "Jackson, MS",          lat: 32.30,   lon: -90.18 },
  { name: "Kansas City, MO",      lat: 39.10,   lon: -94.58 },
  { name: "Billings, MT",         lat: 45.78,   lon: -108.50 },
  { name: "Omaha, NE",            lat: 41.26,   lon: -96.00 },
  { name: "Las Vegas, NV",        lat: 36.17,   lon: -115.14 },
  { name: "Manchester, NH",       lat: 42.99,   lon: -71.46 },
  { name: "Newark, NJ",           lat: 40.73,   lon: -74.17 },
  { name: "Albuquerque, NM",      lat: 35.11,   lon: -106.61 },
  { name: "New York, NY",         lat: 40.71,   lon: -74.01 },
  { name: "Charlotte, NC",        lat: 35.23,   lon: -80.84 },
  { name: "Fargo, ND",            lat: 46.88,   lon: -96.79 },
  { name: "Columbus, OH",         lat: 39.99,   lon: -82.99 },
  { name: "Oklahoma City, OK",    lat: 35.47,   lon: -97.52 },
  { name: "Portland, OR",         lat: 45.52,   lon: -122.68 },
  { name: "Philadelphia, PA",     lat: 39.95,   lon: -75.17 },
  { name: "Providence, RI",       lat: 41.82,   lon: -71.41 },
  { name: "Columbia, SC",         lat: 34.00,   lon: -81.03 },
  { name: "Sioux Falls, SD",      lat: 43.55,   lon: -96.73 },
  { name: "Memphis, TN",          lat: 35.15,   lon: -90.05 },
  { name: "Houston, TX",          lat: 29.76,   lon: -95.37 },
  { name: "Salt Lake City, UT",   lat: 40.76,   lon: -111.89 },
  { name: "Burlington, VT",       lat: 44.48,   lon: -73.21 },
  { name: "Virginia Beach, VA",   lat: 36.85,   lon: -76.29 },
  { name: "Seattle, WA",          lat: 47.61,   lon: -122.33 },
  { name: "Charleston, WV",       lat: 38.35,   lon: -81.63 },
  { name: "Milwaukee, WI",        lat: 43.04,   lon: -87.91 },
  { name: "Cheyenne, WY",         lat: 41.14,   lon: -104.82 },
];


const weatherCategoryMap = (code) => {
  if ([0, 1, 2].includes(code)) return "Sunny";
  if ([3, 45, 48].includes(code)) return "Cloudy";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
  if ([95, 96, 99].includes(code)) return "Rainy";
  return "Unknown";
};

const weatherOptions = ["Sunny", "Cloudy", "Rainy", "Snowy"];

const Preferences = () => {
  const [tempRange, setTempRange] = useState({ min: 50, max: 80 });
  const [selectedWeather, setSelectedWeather] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (lat, lon) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`;
    const response = await fetch(url);
    const data = await response.json();
    const temp = data.current_weather?.temperature;
    const code = data.current_weather?.weathercode;
    const condition = weatherCategoryMap(code);
    return { temp, condition };
  };

  const fetchSuggestions = async (weatherFilter) => {
    setLoading(true);
    try {
      const results = await Promise.all(
        cityCandidates.map(async (city) => {
          try {
            const { temp, condition } = await fetchWeather(city.lat, city.lon);
            return { ...city, temp, condition };
          } catch {
            return null;
          }
        })
      );

      const filtered = results
        .filter(
          (c) =>
            c &&
            c.temp >= tempRange.min &&
            c.temp <= tempRange.max &&
            (weatherFilter.length > 0 ? weatherFilter.includes(c.condition) : true)
        )
        .sort((a, b) => Math.abs((a.temp - tempRange.min + a.temp - tempRange.max)/2) - Math.abs((b.temp - tempRange.min + b.temp - tempRange.max)/2));

      setSuggestions(filtered);
    } catch (err) {
      console.error(err);
      alert("Error fetching location suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = () => {
    if (tempRange.min > tempRange.max) return alert("Min temperature cannot be higher than max!");
    fetchSuggestions(selectedWeather);
  };

  const toggleWeather = (option) => {
    setSelectedWeather((prev) =>
      prev.includes(option) ? prev.filter((w) => w !== option) : [...prev, option]
    );
  };

  // Fetch current weather at user's location on page load
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const weather = await fetchWeather(latitude, longitude);
        setCurrentWeather(weather);
      },
      (error) => {
        console.error("Could not get current location weather:", error);
      }
    );
  }, []);

  return (
    <div className="preferences-container">
      <Sidebar />
      <div className="preferences-main">
        <h2>Preferences</h2>

        {/* Current Weather Box */}
        {currentWeather && (
          <div className="section-box">
            <h3>Current Weather</h3>
            <p>Temperature: {currentWeather.temp.toFixed(1)}°F</p>
            <p>Weather: {currentWeather.condition}</p>
          </div>
        )}

        {/* Temperature Box */}
        <div className="section-box">
          <h3>Temperature</h3>
          <div className="slider-container">
            <label>Min: {tempRange.min}°F</label>
            <input
              type="range"
              min="0"
              max="100"
              value={tempRange.min}
              onChange={(e) => setTempRange({ ...tempRange, min: Number(e.target.value) })}
            />
          </div>
          <div className="slider-container">
            <label>Max: {tempRange.max}°F</label>
            <input
              type="range"
              min="0"
              max="100"
              value={tempRange.max}
              onChange={(e) => setTempRange({ ...tempRange, max: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Weather Box */}
        <div className="section-box">
          <h3>Weather</h3>
          <div className="weather-toggle-container">
            {weatherOptions.map((option) => (
              <div
                key={option}
                className={`weather-toggle ${selectedWeather.includes(option) ? "active" : ""}`}
                onClick={() => toggleWeather(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>

        {/* Button Box */}
        <div className="section-box">
          <button onClick={handleGetSuggestions} disabled={loading}>
            {loading ? "Loading..." : "Find Locations"}
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
        <div className="section-box">
            <h3>Suggested Locations</h3>
            <div className="cards-container">
            {suggestions.map((loc, index) => (
                <div className="location-card" key={index}>
                <h4>{loc.name}</h4>
                <p>Temperature: {loc.temp.toFixed(1)}°F</p>
                <p>Weather: {loc.condition}</p>
                {/* Latitude and longitude removed */}
                </div>
            ))}
            </div>
        </div>
        )}

        {suggestions.length === 0 && !loading && (
        <div className="section-box">
            <p>No locations found matching your preferences.</p>
        </div>
        )}

      </div>
    </div>
  );
};

export default Preferences;
