// src/CreateTrip.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./CreateTrip.css";

import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const CreateTrip = () => {
  const navigate = useNavigate();

  const [tripName, setTripName] = useState("");
  const [startCity, setStartCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState([]);

  const [error, setError] = useState("");

  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const CURRENT_USER_ID = userProfile.uid;
  const CURRENT_USER_NAME =
    userProfile.firstName || userProfile.name || userProfile.email;

  useEffect(() => {
    if (!CURRENT_USER_NAME) return;
    setMembers((prev) => {
      if (prev.includes(CURRENT_USER_NAME)) return prev;
      return [CURRENT_USER_NAME, ...prev];
    });
  }, [CURRENT_USER_NAME]);

  const addMember = () => {
    const clean = memberInput.trim();
    if (!clean || members.includes(clean)) return;

    setMembers((prev) => [...prev, clean]);
    setMemberInput("");
  };

  const removeMember = (name) => {
    if (name === CURRENT_USER_NAME) return;
    setMembers((prev) => prev.filter((m) => m !== name));
  };

  const geocodeCity = async (city) => {
    const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
      city
    )}&format=json&limit=1`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Wanderplan/1.0" },
    });

    const data = await res.json();
    if (!data.length) return null;

    return {
      lat: data[0].lat,
      lon: data[0].lon,
    };
  };

  const handleNext = async () => {
    setError("");

    if (!tripName || !startCity || !destinationCity || !startDate || !endDate) {
      setError("Please fill all required fields.");
      return;
    }

    if (members.length === 0) {
      setError("Please add at least one member.");
      return;
    }

    try {
      const startLoc = await geocodeCity(startCity);
      const destLoc = await geocodeCity(destinationCity);

      if (!startLoc) return setError("Starting city not found.");
      if (!destLoc) return setError("Destination city not found.");

      const tripRef = await addDoc(collection(db, "trips"), {
        tripName,
        startCity,
        destinationCity,
        startDate,
        endDate,
        createdAt: Date.now(),
        ownerId: CURRENT_USER_ID,
        ownerName: CURRENT_USER_NAME,
        members,
        start: {
          city: startCity,
          lat: startLoc.lat,
          lon: startLoc.lon,
        },
        destination: {
          city: destinationCity,
          lat: destLoc.lat,
          lon: destLoc.lon,
        },
      });

      const tripId = tripRef.id;

      const groupRef = await addDoc(collection(db, "groups"), {
        groupName: `${tripName} Group`,
        members,
        createdAt: Date.now(),
        assignedTripId: tripId,
        assignedTripName: tripName,
        assignedTripFrom: startCity,
        assignedTripTo: destinationCity,
        messages: [],
      });

      navigate("/NewTrip", {
        state: {
          tripId,
          groupId: groupRef.id,
        },
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving the trip.");
    }
  };

  return (
    <div className="create-container">
      <Sidebar />

      <div className="create-main">
        <h1 className="create-title">Create a Trip</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="form-section">
          <label>Trip Name</label>
          <input
            type="text"
            placeholder="Enter trip name"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
          />

          <label>Starting City</label>
          <input
            type="text"
            placeholder="Enter start city"
            value={startCity}
            onChange={(e) => setStartCity(e.target.value)}
          />

          <label>Destination City</label>
          <input
            type="text"
            placeholder="Enter destination"
            value={destinationCity}
            onChange={(e) => setDestinationCity(e.target.value)}
          />

          <div className="date-row">
            <div className="date-field">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="date-field">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <label>Members</label>
          <div className="member-input-row">
            <input
              type="text"
              placeholder="Add member name"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMember()}
            />
            <button className="small-btn" onClick={addMember}>
              Add
            </button>
          </div>

          <div className="member-chip-container">
            {members.map((m) => (
              <span key={m} className="member-chip">
                {m}
                {m !== CURRENT_USER_NAME && (
                  <button
                    className="remove-chip-btn"
                    onClick={() => removeMember(m)}
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        <button className="next-btn" onClick={handleNext}>
          Save Trip
        </button>
      </div>
    </div>
  );
};

export default CreateTrip;
