import React, { useState } from "react";
import "./Manage_Location.css";

export default function ManageLocation() {
    // Example queries
  const [locations, setLocations] = useState([
    { id: 1, name: "Home", address: "500 Hudson Ave", type: "Trip A" },
    { id: 2, name: "Work", address: "4200 Washington Ave", type: "Trip B" },
    { id: 3, name: "Beach Trip", address: "Trip A", type: "" },
    { id: 4, name: "Great Smokey Mountains", address: "Trip B", type: "" },
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
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!form.name || !form.address) return;

    if (selectedId == null) {
      // create
      const newLocation = {
        id: Date.now(),
        name: form.name,
        address: form.address,
        description: form.description,
      };
      setLocations((prev) => [...prev, newLocation]);
    } else {
      // update
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === selectedId ? { ...loc, ...form } : loc
        )
      );
    }

    setForm({ name: "", address: "", type: "" });
    setSelectedId(null);
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
      type: loc.type,
    });
  };

  const handleDelete = () => {
    if (selectedId == null) return;
    setLocations((prev) => prev.filter((l) => l.id !== selectedId));
    setSelectedId(null);
    setForm({ name: "", address: "", type: "" });
  };

  const handleSaveList = () => {
    console.log("Saving all locations", locations);
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
              {loc.type && <div className="location-type">{loc.type}</div>}
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