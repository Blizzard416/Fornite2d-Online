const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema to record user information
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

// Export schema
const User = mongoose.model("user", UserSchema);
module.exports = User;