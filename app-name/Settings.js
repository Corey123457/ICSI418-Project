import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import "./Settings.css";
import { useNavigate } from "react-router-dom";

import { auth, db } from "./firebase";
import { onAuthStateChanged, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Settings = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      setUserId(user.uid);
      setEmail(user.email || "");
      await loadProfile(user.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadProfile = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();

        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setDob(data.dob || "");
        setProfilePic(data.profilePic || data.profilePicUrl || "");

        saveToLocalStorage({
          firstName: data.firstName,
          lastName: data.lastName,
          profilePic: data.profilePic || data.profilePicUrl,
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const saveToLocalStorage = (updates = {}) => {
    const existing = JSON.parse(localStorage.getItem("userProfile") || "{}");

    const updated = {
      ...existing,
      ...updates,
      uid: userId,
      email: email,
      name:
        updates.firstName ||
        existing.firstName ||
        existing.name ||
        email,
    };

    Object.keys(updated).forEach(
      (key) => updated[key] === undefined && delete updated[key]
    );

    localStorage.setItem("userProfile", JSON.stringify(updated));
  };

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !userId) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;

      setProfilePic(base64);

      try {
        await setDoc(
          doc(db, "users", userId),
          { profilePic: base64 },
          { merge: true }
        );

        saveToLocalStorage({ profilePic: base64 });
        alert("Profile picture updated!");
      } catch (err) {
        console.error("Upload error:", err);
      }
    };

    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!userId) return;

    try {
      await setDoc(
        doc(db, "users", userId),
        {
          firstName,
          lastName,
          dob,
          profilePic,
        },
        { merge: true }
      );

      saveToLocalStorage({
        firstName,
        lastName,
        dob,
        profilePic,
      });

      alert("Profile updated!");
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save profile.");
    }
  };

  const handlePasswordChange = async () => {
    if (newPass !== confirmPass) {
      setPassError("Passwords do not match!");
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPass);
      alert("Password updated successfully!");
      setNewPass("");
      setConfirmPass("");
      setPassError("");
    } catch (err) {
      console.error(err);
      alert("Failed to update password. You may need to re-login.");
    }
  };

  const logout = () => {
    auth.signOut();
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <Sidebar />
        <h2>Loading your profile...</h2>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <Sidebar />

      <div className="settings-main">
        <h1>Settings</h1>

        <div className="pic-section">
          <img
            src={profilePic || "https://via.placeholder.com/120?text=Profile"}
            alt="Profile"
            className="profile-pic"
          />
          <input type="file" accept="image/*" onChange={handlePicUpload} />
        </div>

        <div className="settings-card">
          <h2>Personal Information</h2>

          <label>First Name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <label>Last Name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <label>Date of Birth</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />

          <label>Email (read only)</label>
          <input value={email} readOnly />

          <button className="save-btn" onClick={saveProfile}>
            Save Profile
          </button>
        </div>

        <div className="settings-card">
          <h2>Security</h2>

          {passError && <p className="error">{passError}</p>}

          <label>New Password</label>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />

          <button className="save-btn" onClick={handlePasswordChange}>
            Update Password
          </button>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;