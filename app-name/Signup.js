// src/Signup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = cred.user;

      // Save basic profile document
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        email: user.email,
      });

      // Store in localStorage for app-wide access
      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: firstName || user.email.split("@")[0],
        })
      );

      navigate("/Dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to create account.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Create Account</h1>

        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="First Name (display name)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button onClick={handleSignup}>Signup</button>

        <p className="login-link" onClick={() => navigate("/")}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
};

export default Signup;
