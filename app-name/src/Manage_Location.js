import React, { useState } from "react";
import "./Manage_Location.css";

export default function ManageLocation() {
    // Example queries
  const [locations, setLocations] = useState([
    { id: 1, name: "Home", address: "500 Hudson Ave", description: "Trip A" },
    { id: 2, name: "Work", address: "4200 Washington Ave", description: "Trip B" },
    { id: 3, name: "Beach Trip", address: "Trip A", description: "" },
    { id: 4, name: "Great Smokey Mountains", address: "Trip B", description: "" },
  ]);

  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
  });

  // which location is selected
  const [selectedId, setSelectedId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add new OR update existing
  const handleSaveForm = async (e) => {
  e.preventDefault();
  if (!form.name || !form.address) return;

  // Only include id if it’s a Mongo string, not the initial numeric ones
  const isMongoId = typeof selectedId === "string";
  const payload = {
    ...(isMongoId ? { id: selectedId } : {}),
    name: form.name,
    address: form.address,
    description: form.description,
  };

  try {
    const res = await fetch("http://localhost:9000/saveLocation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const saved = await res.json();

    if (!res.ok) {
      console.error(saved);
      return;
    }

    if (!isMongoId) {
      // treat as create, even if editing a seed row
      const newLocation = {
        id: saved._id,
        name: saved.name,
        address: saved.address,
        description: saved.description,
      };
      setLocations((prev) => [...prev, newLocation]);
    } else {
      // normal update
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === selectedId
            ? {
                ...loc,
                name: saved.name,
                address: saved.address,
                description: saved.description,
              }
            : loc
        )
      );
    }

    setForm({ name: "", address: "", description: "" });
    setSelectedId(null);
  } catch (err) {
    console.error("Error saving location", err);
  }
};


  const handleSelect = (loc) => {
    setSelectedId(loc.id);
  };

  const handleEdit = () => {
    const loc = locations.find((l) => l.id === selectedId);
    if (!loc) return;
    // load values into form
    setForm({
      name: loc.name,
      address: loc.address,
      description: loc.description,
    });
  };

  const handleDelete = async () => {
  if (selectedId == null) return;

  const isMongoId = typeof selectedId === "string";

  // Always remove from UI
  setLocations((prev) => prev.filter((l) => l.id !== selectedId));
  setSelectedId(null);
  setForm({ name: "", address: "", description: "" });

  // Only hit Mongo if it's a real _id
  if (!isMongoId) return;

  try {
    const res = await fetch(
      `http://localhost:9000/deleteLocation/${selectedId}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      console.error("Failed to delete location in DB");
    }
  } catch (err) {
    console.error("Error deleting location", err);
  }
};

  
  return (
    <div className="page">
      <div className="card">
        <h2 className="card-title">Manage Location</h2>

        <ul className="location-list">
          {locations.map((loc) => (
            <li
              key={loc.id}
              className={
                "location-item" +
                (loc.id === selectedId ? " location-item--selected" : "")
              }
              onClick={() => handleSelect(loc)}
            >
              <div className="location-name">{loc.name}</div>
              <div className="location-address">{loc.address}</div>
              {loc.description && <div className="location-type">{loc.description}</div>}
            </li>
          ))}
        </ul>

        <div className="card-footer">
          <button className="btn-outline" onClick={handleDelete}>
            Delete Location
          </button>
          <button className="btn-outline" onClick={handleEdit}>
            Edit Location
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          {selectedId == null ? "Add Location" : "Edit Location"}
        </h2>

        <form className="form" onSubmit={handleSaveForm}>
          <label className="field">
            <span className="field-label">Name of the Location</span>
            <input
              name="name"
              placeholder="Type here"
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span className="field-label">Address</span>
            <input
              name="address"
              placeholder="Type here"
              value={form.address}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span className="field-label">Description</span>
            <input
              name="description"
              placeholder="Type here"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <div className="form-footer">
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}