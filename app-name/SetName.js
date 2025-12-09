import React, { useState } from "react";

export default function SetName() {
  const [name, setName] = useState("");

  const saveName = () => {
    if (!name.trim()) return;

    // Save user identity to localStorage
    localStorage.setItem(
      "userProfile",
      JSON.stringify({ firstName: name.trim() })
    );

    // Redirect to Groups page
    window.location.href = "/Groups";
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Set Your Name</h1>
      <p>This name will appear in group chat.</p>

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: "12px",
          width: "250px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginTop: "20px"
        }}
      />

      <br />

      <button
        onClick={saveName}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#4a8bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Continue
      </button>
    </div>
  );
}

