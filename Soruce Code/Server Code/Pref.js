const mongoose = require("mongoose");

const PreferenceSchema = new mongoose.Schema({
    pref: String
});

const Preference = mongoose.model("Preference", PreferenceSchema);

module.exports = Preference;