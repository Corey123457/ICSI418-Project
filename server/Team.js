const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
    team_name: { type: String, required: true },
    members: { type: [String], default: [] },
    tripId: { type: String, default: "" }
});

module.exports = mongoose.model("Team", TeamSchema);
