import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./Trip.css";

import { db } from "./firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const Trip = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const tripId = state?.tripId;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkedGroupId, setLinkedGroupId] = useState(null);
  const [showEditMembers, setShowEditMembers] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const CURRENT_USER_ID = profile?.uid;

  useEffect(() => {
    if (!tripId) return;

    const loadTrip = async () => {
      try {
        const ref = doc(db, "trips", tripId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setTrip(data);
          loadLinkedGroup(data.id);
        }
      } catch (err) {
        console.error("Error loading trip:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [tripId]);

  const loadLinkedGroup = async (tripId) => {
    try {
      const qGroups = query(
        collection(db, "groups"),
        where("assignedTripId", "==", tripId)
      );
      const snap = await getDocs(qGroups);
      if (!snap.empty) {
        setLinkedGroupId(snap.docs[0].id);
      }
    } catch (err) {
      console.error("Group read error:", err);
    }
  };

  const isOwner = trip?.ownerId === CURRENT_USER_ID;

  const addMember = async () => {
    if (!newMemberName.trim()) return;

    const updated = [...trip.members, newMemberName.trim()];

    await updateDoc(doc(db, "trips", trip.id), {
      members: updated,
    });

    setTrip((prev) => ({ ...prev, members: updated }));
    setNewMemberName("");
  };

  const removeMember = async (name) => {
    const updated = trip.members.filter((m) => m !== name);

    await updateDoc(doc(db, "trips", trip.id), {
      members: updated,
    });

    setTrip((prev) => ({ ...prev, members: updated }));
  };

  if (loading)
    return (
      <div className="trip-loading">
        <Sidebar />
        <h2>Loading trip...</h2>
      </div>
    );

  if (!trip)
    return (
      <div className="trip-missing">
        <Sidebar />
        <h2>Trip not found.</h2>
        <button onClick={() => navigate("/Dashboard")}>Go Back</button>
      </div>
    );

  return (
    <div className="trip-container">
      <Sidebar />

      <div className="trip-main">
        <h1 className="trip-title">{trip.tripName}</h1>

        <p className="trip-route">
          <strong>From:</strong> {trip.start?.city} → <strong>To:</strong>{" "}
          {trip.destination?.city}
        </p>

        <p className="trip-dates">
          {trip.startDate} → {trip.endDate}
        </p>

        <div className="trip-members-section">
          <h3>Group Members</h3>

          <div className="member-list">
            {trip.members?.map((m, i) => (
              <span className="member-chip" key={i}>
                {m}
                {isOwner && (
                  <button
                    className="remove-member-btn"
                    onClick={() => removeMember(m)}
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
          </div>

          {isOwner && (
            <button
              className="edit-members-btn"
              onClick={() => setShowEditMembers(true)}
            >
              Edit Members
            </button>
          )}
        </div>

        <div className="trip-actions">
          <button
            className="big-btn"
            onClick={() => navigate("/Itinerary", { state: { tripId } })}
          >
            View Itinerary →
          </button>

          <button
            className="big-btn"
            onClick={() => navigate("/NewTrip", { state: { tripId } })}
          >
            Explore Nearby Places →
          </button>
        </div>

        {linkedGroupId && (
          <button
            className="big-btn"
            style={{ marginTop: "15px" }}
            onClick={() =>
              navigate("/Groups", {
                state: { groupId: linkedGroupId },
              })
            }
          >
            Open Group Chat 💬
          </button>
        )}
      </div>

      {showEditMembers && (
        <div className="modal-bg">
          <div className="modal-box">
            <h3>Edit Members</h3>

            <input
              type="text"
              placeholder="Enter member name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
            />

            <button className="save-btn" onClick={addMember}>
              Add Member
            </button>

            <button
              className="cancel-btn"
              onClick={() => setShowEditMembers(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trip;
