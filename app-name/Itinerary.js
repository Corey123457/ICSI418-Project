import React, { useEffect, useState, useRef } from "react";
import Sidebar from "./components/Sidebar";
import "./Itinerary.css";
import html2canvas from "html2canvas";

import { useLocation } from "react-router-dom";

import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc
} from "firebase/firestore";

const getIconForCategory = (categoryRaw) => {
  if (!categoryRaw) return "📍";
  const c = String(categoryRaw).toLowerCase();

  if (c.includes("restaurant") || c.includes("food") || c.includes("bar"))
    return "🍽️";
  if (c.includes("cafe") || c.includes("coffee")) return "☕";
  if (c.includes("park") || c.includes("garden")) return "🌳";
  if (c.includes("museum")) return "🏛️";
  if (c.includes("attraction") || c.includes("viewpoint")) return "📸";
  if (c.includes("hotel")) return "🏨";

  return "📍";
};

const prettySlot = (slot) => {
  switch (slot) {
    case "morning": return "Morning";
    case "afternoon": return "Afternoon";
    case "evening": return "Evening";
    case "late-night": return "Late Night";
    default: return slot || "";
  }
};

const Itinerary = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [userPrefs, setUserPrefs] = useState(null);

  const itineraryRef = useRef(null);

  const takeScreenshot = async () => {
    if (!itineraryRef.current) return;

    const canvas = await html2canvas(itineraryRef.current, {
      useCORS: true,
      scale: 2
    });

    const link = document.createElement("a");
    link.download = "Itinerary.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const CURRENT_USER_ID = userProfile?.uid;
  const CURRENT_USER_NAME =
    userProfile.firstName ||
    userProfile.name ||
    userProfile.email ||
    "";

  const { state } = useLocation();
  const passedTripId = state?.tripId || null;

  useEffect(() => {
    const loadPrefs = async () => {
      if (!CURRENT_USER_ID) return;
      const snap = await getDoc(doc(db, "preferences", CURRENT_USER_ID));
      if (snap.exists()) setUserPrefs(snap.data());
    };
    loadPrefs();
  }, [CURRENT_USER_ID]);

  useEffect(() => {
    if (!CURRENT_USER_ID) return;

    const loadTrips = async () => {
      try {
        let tripsArr = [];

        const qOwner = query(
          collection(db, "trips"),
          where("ownerId", "==", CURRENT_USER_ID)
        );

        const qMember = query(
          collection(db, "trips"),
          where("members", "array-contains", CURRENT_USER_NAME)
        );

        const snapOwner = await getDocs(qOwner);
        const snapMember = await getDocs(qMember);

        snapOwner.docs.forEach((d) => {
          tripsArr.push({ id: d.id, ...d.data(), itinerary: [] });
        });

        snapMember.docs.forEach((d) => {
          if (!tripsArr.find((t) => t.id === d.id)) {
            tripsArr.push({ id: d.id, ...d.data(), itinerary: [] });
          }
        });

        for (let t of tripsArr) {
          const itemsSnap = await getDocs(
            collection(db, "trips", t.id, "itineraryItems")
          );
          t.itinerary = itemsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data()
          }));
        }

        setTrips(tripsArr);

        if (passedTripId) setSelectedTripId(passedTripId);
        else if (tripsArr.length > 0) setSelectedTripId(tripsArr[0].id);

      } catch (err) {
        console.error("Error loading itineraries:", err);
      }
    };

    loadTrips();
  }, [CURRENT_USER_ID, CURRENT_USER_NAME, passedTripId]);

  const activeTrip = trips.find((t) => t.id === selectedTripId) || null;

  const doesDayMatchPreferences = (dateString) => {
    if (!userPrefs) return false;

    const { prefStart, prefEnd } = userPrefs;
    if (!prefStart || !prefEnd) return false;

    const d = new Date(dateString);
    const ps = new Date(prefStart);
    const pe = new Date(prefEnd);

    return d >= ps && d <= pe;
  };

  const deleteTrip = async (tripId) => {
    if (!window.confirm("Delete this trip and all items?")) return;

    try {
      const itemsSnap = await getDocs(
        collection(db, "trips", tripId, "itineraryItems")
      );

      await Promise.all(itemsSnap.docs.map((d) => deleteDoc(d.ref)));
      await deleteDoc(doc(db, "trips", tripId));

      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      if (selectedTripId === tripId) setSelectedTripId(null);
    } catch (err) {
      console.error("Error deleting trip:", err);
    }
  };

  const deletePlace = async (tripId, placeId) => {
    if (!window.confirm("Remove this place?")) return;

    try {
      await deleteDoc(doc(db, "trips", tripId, "itineraryItems", placeId));

      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId
            ? { ...t, itinerary: t.itinerary.filter((p) => p.id !== placeId) }
            : t
        )
      );
    } catch (err) {
      console.error("Error deleting place:", err);
    }
  };

  const groupByDay = () => {
    if (!activeTrip) return {};

    const days = {};

    activeTrip.itinerary.forEach((item) => {
      const dayIndex =
        typeof item.dayIndex === "number" && !isNaN(item.dayIndex)
          ? item.dayIndex
          : 0;

      if (!days[dayIndex]) days[dayIndex] = [];
      days[dayIndex].push(item);
    });

    Object.keys(days).forEach((k) => {
      days[k].sort((a, b) => (a.timeMinutes || 0) - (b.timeMinutes || 0));
    });

    return days;
  };

  const days = groupByDay();

  const getDateForDayIndex = (trip, index) => {
    if (!trip?.startDate) return "";
    const d = new Date(trip.startDate);
    d.setDate(d.getDate() + index);
    return d.toDateString();
  };

  return (
    <div className="itinerary-container">
      <Sidebar />

      <div className="itinerary-main" ref={itineraryRef}>
        <h1>Your Trips & Itineraries</h1>

        <div className="trip-selector">
          {trips.map((t) => (
            <button
              key={t.id}
              className={t.id === selectedTripId ? "trip-btn active" : "trip-btn"}
              onClick={() => setSelectedTripId(t.id)}
            >
              {t.tripName}
            </button>
          ))}
        </div>

        {activeTrip && (
          <button className="screenshot-btn" onClick={takeScreenshot}>
            Screenshot Itinerary
          </button>
        )}

        {!activeTrip ? (
          <p>Select a trip to view its itinerary.</p>
        ) : (
          <>
            <div className="hero-box">
              <div>
                <h2>{activeTrip.tripName}</h2>
                <p>
                  <strong>From:</strong> {activeTrip.start?.city} →{" "}
                  <strong>To:</strong> {activeTrip.destination?.city}
                </p>
                <p>
                  {activeTrip.startDate} — {activeTrip.endDate}
                </p>
              </div>

              <button className="delete-trip-btn" onClick={() => deleteTrip(activeTrip.id)}>
                Delete Trip
              </button>
            </div>

            <div className="timeline-container">
              {Object.keys(days).map((dayKey) => {
                const dayIndex = Number(dayKey);
                const date = getDateForDayIndex(activeTrip, dayIndex);
                const matchesPrefs = doesDayMatchPreferences(date);

                return (
                  <div className="day-block" key={dayKey}>
                    <h3>
                      Day {dayIndex + 1} • {date}
                      {matchesPrefs && <span className="pref-badge">✓ Matches Preferences</span>}
                    </h3>

                    <div className="vertical-timeline">
                      {days[dayIndex].map((p) => {
                        const icon = getIconForCategory(p.category);
                        const slotLabel = prettySlot(p.timeSlot);

                        return (
                          <div className="timeline-row" key={p.id}>
                            <div className="timeline-time-col">
                              <div className="timeline-time">
                                {p.time || "--:--"}
                              </div>
                              {slotLabel && (
                                <div className={`time-slot-badge ${p.timeSlot || ""}`}>
                                  {slotLabel}
                                </div>
                              )}
                            </div>

                            <div className="timeline-line-col">
                              <div className="timeline-dot" />
                              <div className="timeline-line" />
                            </div>

                            <div className="timeline-card">
                              <div className="timeline-card-header">
                                <span className="timeline-icon">{icon}</span>
                                <h4>{p.name}</h4>
                              </div>

                              <p className="category">{p.category || "Place"}</p>

                              <a
                                href={`https://www.google.com/maps?q=${p.lat},${p.lon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View on Map
                              </a>

                              <button
                                className="delete-place"
                                onClick={() => deletePlace(activeTrip.id, p.id)}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Itinerary;
