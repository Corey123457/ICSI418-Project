import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import "./Dashboard.css";

import { db, auth } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ADMIN_UID = "PUT_YOUR_ADMIN_UID_HERE";

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsub();
  }, []);

  const getTripImage = (dest) => {
    if (!dest?.city) return "/default-trip.jpg";
    return `https://picsum.photos/seed/${encodeURIComponent(dest.city)}/600/400`;
  };

  const getMemberPreview = (members = []) => {
    if (!members.length) return "Solo Trip";
    const first = members.slice(0, 3).join(", ");
    return first + (members.length > 3 ? ` +${members.length - 3}` : "");
  };

  const loadAllTripsForOwner = async () => {
    const snap = await getDocs(collection(db, "trips"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  const loadTripsForUser = async (uid, name) => {
    let results = [];

    const q1 = query(collection(db, "trips"), where("ownerId", "==", uid));
    const s1 = await getDocs(q1);
    s1.forEach((d) => results.push({ id: d.id, ...d.data() }));

    const q2 = query(
      collection(db, "trips"),
      where("members", "array-contains", name)
    );
    const s2 = await getDocs(q2);

    s2.forEach((d) => {
      if (!results.find((t) => t.id === d.id)) {
        results.push({ id: d.id, ...d.data() });
      }
    });

    return results;
  };

  useEffect(() => {
    if (!userId) return;

    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userName =
      userProfile?.firstName ||
      userProfile?.name ||
      userProfile?.email ||
      "Unknown";

    async function load() {
      let finalTrips = [];

      if (userId === ADMIN_UID) {
        finalTrips = await loadAllTripsForOwner();
      } else {
        finalTrips = await loadTripsForUser(userId, userName);
      }

      setTrips(finalTrips);
    }

    load();
  }, [userId]);

  return (
    <div className="dash-container">
      <Sidebar />

      <div className="dash-main">
        <div className="dash-header">
          <h1>Dashboard</h1>

          <button
            className="create-trip-btn"
            onClick={() => navigate("/CreateTrip")}
          >
            + Create Trip
          </button>
        </div>

        <h2 className="section-title">Your Trips</h2>

        <div className="trip-grid">
          {trips.map((trip) => (
            <div key={trip.id} className="trip-card">
              <div className="trip-card-img-wrapper">
                <img
                  src={getTripImage(trip.destination)}
                  className="trip-card-img"
                  alt="trip"
                />
              </div>

              <div className="trip-card-body">
                <h3>{trip.tripName}</h3>

                <p>
                  <strong>From:</strong> {trip.start?.city} →{" "}
                  <strong>To:</strong> {trip.destination?.city}
                </p>

                <p>
                  {trip.startDate} → {trip.endDate}
                </p>

                <div>👥 {getMemberPreview(trip.members)}</div>

                <button
                  className="continue-btn"
                  onClick={() =>
                    navigate("/Trip", { state: { tripId: trip.id } })
                  }
                >
                  Continue Planning →
                </button>
              </div>
            </div>
          ))}

          {trips.length === 0 && <p>No trips yet. Create one!</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;