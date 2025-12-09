import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      const fallbackName = user.displayName || user.email.split("@")[0];

      const profile = {
        uid: user.uid,
        email: user.email,
        name: fallbackName,
        firstName: fallbackName,
        lastName: "",
        dob: "",
        profilePic: "",
      };

      localStorage.setItem("userProfile", JSON.stringify(profile));

      navigate("/Dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>WanderPlan</h1>

        {error && <p className="error">{error}</p>}

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

        <button onClick={handleLogin}>Login</button>

        <div className="login-links">
          <p onClick={() => navigate("/Signup")}>Signup</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
