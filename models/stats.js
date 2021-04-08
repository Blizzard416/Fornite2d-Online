const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

const Stats = mongoose.model("stats", StatsSchema);
module.exports = Stats;