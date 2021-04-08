const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema to record user stats
const StatsSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    mostKills: {
        type: Number,
        required: true
    }
});

// Export schema
const Stats = mongoose.model("stats", StatsSchema);
module.exports = Stats;