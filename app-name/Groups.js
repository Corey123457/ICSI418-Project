import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import "./Groups.css";

import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  arrayUnion,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

import { useLocation } from "react-router-dom";

function MembersPopup({ open, onClose, members = [] }) {
  if (!open) return null;

  return (
    <div className="members-modal-backdrop" onClick={onClose}>
      <div className="members-modal" onClick={(e) => e.stopPropagation()}>
        <div className="members-modal-header">
          <h3>Group Members</h3>
          <button className="members-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="members-modal-body">
          {members.length === 0 ? (
            <p>No members yet</p>
          ) : (
            members.map((m, i) => (
              <div className="members-modal-item" key={i}>
                {m}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const Groups = () => {
  const location = useLocation();
  const passedGroupId = location.state?.groupId || null;

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [newGroupName, setNewGroupName] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [chatInput, setChatInput] = useState("");

  const [isMembersOpen, setIsMembersOpen] = useState(false);

  const [trips, setTrips] = useState([]);
  const chatRef = useRef(null);

  const [selectedMember, setSelectedMember] = useState("");
  const [dmMessages, setDmMessages] = useState([]);
  const dmUnsubRef = useRef(null);

  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const CURRENT_USER_NAME =
    userProfile.firstName || userProfile.name || userProfile.email || "User";
  const CURRENT_USER_ID = userProfile.uid;

  useEffect(() => {
    const q = query(
      collection(db, "groups"),
      where("members", "array-contains", CURRENT_USER_NAME)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setGroups(data);

      if (passedGroupId) {
        setSelectedGroupId(passedGroupId);
      } else if (!selectedGroupId && data.length > 0) {
        setSelectedGroupId(data[0].id);
      }
    });

    return () => unsub();
  }, [CURRENT_USER_NAME]);

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || null;

  useEffect(() => {
    const loadTrips = async () => {
      const snap = await getDocs(collection(db, "trips"));
      const tripList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTrips(tripList);
    };

    loadTrips();
  }, []);

  useEffect(() => {
    if (dmUnsubRef.current) {
      dmUnsubRef.current();
      dmUnsubRef.current = null;
    }

    if (!activeGroup || !selectedMember) {
      setDmMessages([]);
      return;
    }

    const chatId = [CURRENT_USER_NAME, selectedMember].sort().join("__");

    const msgsRef = collection(
      db,
      "groups",
      activeGroup.id,
      "dm",
      chatId,
      "messages"
    );
    const qMsgs = query(msgsRef, orderBy("timestamp", "asc"));

    const unsub = onSnapshot(qMsgs, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDmMessages(list);
    });

    dmUnsubRef.current = unsub;

    return () => {
      if (dmUnsubRef.current) dmUnsubRef.current();
    };
  }, [activeGroup, selectedMember, CURRENT_USER_NAME]);

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    await addDoc(collection(db, "groups"), {
      groupName: newGroupName.trim(),
      members: [CURRENT_USER_NAME],
      messages: [],
      assignedTrip: null,
      createdAt: Date.now(),
    });

    setNewGroupName("");
  };

  const addMember = async () => {
    if (!memberInput.trim() || !activeGroup) return;

    const groupRef = doc(db, "groups", activeGroup.id);
    await updateDoc(groupRef, {
      members: arrayUnion(memberInput.trim()),
    });

    setMemberInput("");
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !activeGroup) return;

    const text = chatInput.trim();
    const timestamp = Date.now();

    if (!selectedMember) {
      const groupRef = doc(db, "groups", activeGroup.id);

      await updateDoc(groupRef, {
        messages: arrayUnion({
          sender: CURRENT_USER_NAME,
          text,
          timestamp,
        }),
      });
    } else {
      const chatId = [CURRENT_USER_NAME, selectedMember].sort().join("__");

      const msgsRef = collection(
        db,
        "groups",
        activeGroup.id,
        "dm",
        chatId,
        "messages"
      );

      await addDoc(msgsRef, {
        sender: CURRENT_USER_NAME,
        receiver: selectedMember,
        text,
        timestamp,
      });
    }

    setChatInput("");

    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 50);
  };

  const assignTrip = async (tripId) => {
    if (!activeGroup) return;

    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const groupRef = doc(db, "groups", activeGroup.id);

    await updateDoc(groupRef, {
      assignedTrip: {
        id: trip.id,
        name: trip.tripName,
        from: trip.start?.city || "",
        to: trip.destination?.city || "",
        startDate: trip.startDate,
        endDate: trip.endDate,
      },
    });
  };

  const groupMessages = [...(activeGroup?.messages || [])].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  const messagesToShow = selectedMember ? dmMessages : groupMessages;

  return (
    <div className="groups-container">
      <Sidebar />

      <div className="groups-main">
        <h1 className="groups-title">Groups</h1>

        <div className="create-group-box">
          <input
            type="text"
            placeholder="New group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button onClick={createGroup}>Create</button>
        </div>

        <div className="groups-layout">
          <div className="group-list">
            <h3>Your Groups</h3>

            {groups.map((g) => (
              <div
                key={g.id}
                className={`group-item ${
                  selectedGroupId === g.id ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedGroupId(g.id);
                  setSelectedMember("");
                }}
              >
                {g.groupName}
              </div>
            ))}
          </div>

          <div className="group-chat">
            {!activeGroup ? (
              <p>Select a group</p>
            ) : (
              <>
                <div className="group-header">
                  <div>
                    <h2>{activeGroup.groupName}</h2>
                    <p>{activeGroup.members?.length} members</p>
                  </div>

                  <button
                    className="pill-btn"
                    onClick={() => setIsMembersOpen(true)}
                  >
                    View Members
                  </button>
                </div>

                <div className="assign-trip-box">
                  <h4>Assign Trip</h4>

                  <select
                    value={activeGroup.assignedTrip?.id || ""}
                    onChange={(e) => assignTrip(e.target.value)}
                  >
                    <option value="">Select a trip</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tripName} — {t.destination?.city}
                      </option>
                    ))}
                  </select>

                  {activeGroup.assignedTrip && (
                    <div className="trip-details-box">
                      <p>
                        <strong>From:</strong> {activeGroup.assignedTrip.from}
                      </p>
                      <p>
                        <strong>To:</strong> {activeGroup.assignedTrip.to}
                      </p>
                    </div>
                  )}
                </div>

                <div className="dm-select-row">
                  <label>Chat with:</label>
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                  >
                    <option value="">Everyone (Group Chat)</option>
                    {(activeGroup.members || [])
                      .filter((m) => m !== CURRENT_USER_NAME)
                      .map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="chat-box" ref={chatRef}>
                  {messagesToShow.length === 0 ? (
                    <p className="empty-text">No messages yet</p>
                  ) : (
                    messagesToShow.map((msg, i) => (
                      <div
                        key={i}
                        className={`chat-message ${
                          msg.sender === CURRENT_USER_NAME ? "mine" : ""
                        }`}
                      >
                        <strong>{msg.sender}:</strong> {msg.text}
                      </div>
                    ))
                  )}
                </div>

                <div className="send-box">
                  <input
                    type="text"
                    placeholder={
                      selectedMember
                        ? `Message ${selectedMember} privately...`
                        : "Message the group..."
                    }
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button onClick={sendMessage}>Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <MembersPopup
        open={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        members={activeGroup?.members || []}
      />
    </div>
  );
};

export default Groups;