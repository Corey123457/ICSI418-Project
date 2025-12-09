import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./NewTrip.css";

import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";

const CATEGORY_MAP = {
  restaurants: 'amenity="restaurant"',
  cafes: 'amenity="cafe"',
  parks: 'leisure="park"',
  museums: 'tourism="museum"',
  attractions: 'tourism="attraction"',
  hotels: 'tourism="hotel"',
};

const NewTrip = () => {
  const { state } = useLocation();
  const tripId = state?.tripId;

  const [trip, setTrip] = useState(null);

  const [weather, setWeather] = useState(null);
  const [places, setPlaces] = useState([]);
  const [activeCategory, setActiveCategory] = useState("restaurants");
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);

  const [selectedHour, setSelectedHour] = useState("10");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  // NEW: store dynamic user GPS location
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const loadTrip = async () => {
      if (!tripId) {
        setError("No trip selected.");
        return;
      }

      try {
        const tripRef = doc(db, "trips", tripId);
        const snap = await getDoc(tripRef);

        if (!snap.exists()) {
          setError("Trip not found.");
          return;
        }

        setTrip({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error("Error loading trip:", err);
        setError("Failed to load trip.");
      }
    };

    loadTrip();
  }, [tripId]);

  // NEW: detect "here" and fetch GPS
  useEffect(() => {
    if (!trip) return;

    if (trip.destination?.city?.toLowerCase() === "here") {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to access your location.");
        }
      );
    }
  }, [trip]);

  // UPDATED: choose destination coords OR user coords
  const destLat =
    trip?.destination?.city?.toLowerCase() === "here"
      ? userLocation?.lat
      : trip?.destination?.lat;

  const destLon =
    trip?.destination?.city?.toLowerCase() === "here"
      ? userLocation?.lon
      : trip?.destination?.lon;

  useEffect(() => {
    if (!destLat || !destLon) return;

    const loadWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${destLat}&longitude=${destLon}&current_weather=true&temperature_unit=fahrenheit`
        );
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (err) {
        console.error("Weather error:", err);
      }
    };

    loadWeather();
  }, [destLat, destLon]);

  useEffect(() => {
    if (!destLat || !destLon) return;

    const loadPlaces = async () => {
      setLoadingPlaces(true);

      const filter = CATEGORY_MAP[activeCategory];
      const overpassQuery = `
        [out:json];
        node(around:5000,${destLat},${destLon})[${filter}];
        out;
      `;

      try {
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: overpassQuery,
        });

        const data = await res.json();
        setPlaces(data.elements || []);
      } catch (err) {
        console.error("Overpass error:", err);
      }

      setLoadingPlaces(false);
    };

    loadPlaces();
  }, [destLat, destLon, activeCategory]);

  const getTripDays = () => {
    if (!trip) return [];

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    const days = [];
    let current = new Date(start);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getMinutesFromTime = (hourStr, minuteStr, period) => {
    let h = parseInt(hourStr, 10);
    const m = parseInt(minuteStr, 10) || 0;

    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return h * 60 + m;
  };

  const getTimeSlot = (totalMinutes) => {
    if (totalMinutes >= 300 && totalMinutes <= 719) return "morning";
    if (totalMinutes >= 720 && totalMinutes <= 1019) return "afternoon";
    if (totalMinutes >= 1020 && totalMinutes <= 1319) return "evening";
    return "late-night";
  };

  const saveItineraryItem = async () => {
    if (!tripId || !selectedPlace) return;

    const minutes = getMinutesFromTime(
      selectedHour,
      selectedMinute,
      selectedPeriod
    );
    const slot = getTimeSlot(minutes);
    const timeLabel = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

    try {
      await addDoc(collection(db, "trips", tripId, "itineraryItems"), {
        name: selectedPlace.tags?.name || "Unnamed Place",
        category:
          selectedPlace.tags?.amenity ||
          selectedPlace.tags?.tourism ||
          selectedPlace.tags?.leisure ||
          "unknown",
        lat: selectedPlace.lat,
        lon: selectedPlace.lon,

        dayIndex: selectedDay - 1,
        time: timeLabel,
        timeMinutes: minutes,
        timeSlot: slot,

        createdAt: Date.now(),
      });

      setShowPopup(false);
      alert("Saved to itinerary!");
    } catch (err) {
      console.error("Error adding to itinerary:", err);
      alert("Failed to add place.");
    }
  };

  if (error) {
    return (
      <div className="trip-container">
        <Sidebar />
        <div className="trip-main">
          <h1>Trip</h1>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="trip-container">
        <Sidebar />
        <div className="trip-main">
          <h1>Loading trip...</h1>
        </div>
      </div>
    );
  }

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className="trip-container">
      <Sidebar />

      <div className="trip-main">
        <h1>{trip.tripName}</h1>

        <p>
          <strong>From:</strong> {trip.start?.city}
        </p>
        <p>
          <strong>Destination:</strong>{" "}
          {trip.destination?.city?.toLowerCase() === "here"
            ? "Your Current Location"
            : trip.destination?.city}
        </p>
        <p>
          <strong>Dates:</strong> {trip.startDate} → {trip.endDate}
        </p>

        <hr />

        <h2>Weather</h2>
        {weather ? (
          <p>
            {weather.temperature}°F · Wind {weather.windspeed} mph
          </p>
        ) : (
          <p>Loading weather...</p>
        )}

        <hr />

        <h2>Nearby Places</h2>
        <div className="filter-row">
          {Object.keys(CATEGORY_MAP).map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? "filter-active" : ""}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loadingPlaces ? (
          <p>Loading places...</p>
        ) : places.length === 0 ? (
          <p>No places found.</p>
        ) : (
          places.map((p) => (
            <div key={p.id} className="place-card">
              <strong>{p.tags?.name || "Unnamed Place"}</strong>
              <p>
                {p.tags?.amenity ||
                  p.tags?.tourism ||
                  p.tags?.leisure ||
                  "Unknown"}
              </p>

              <button
                className="add-btn"
                onClick={() => {
                  setSelectedPlace(p);
                  setShowPopup(true);
                }}
              >
                Add to Itinerary
              </button>

              <button
                className="map-btn"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`
                  )
                }
              >
                View Map
              </button>
            </div>
          ))
        )}
      </div>

      {showPopup && (
        <div className="modal-bg">
          <div className="modal-box">
            <h3>Add to Itinerary</h3>

            <label>Select Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
            >
              {getTripDays().map((d, i) => (
                <option key={i} value={i + 1}>
                  Day {i + 1} — {d.toDateString()}
                </option>
              ))}
            </select>

            <label>Time</label>
            <div className="time-picker-row">
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>

              <span>:</span>

              <select
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(e.target.value)}
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={saveItineraryItem}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewTrip;
