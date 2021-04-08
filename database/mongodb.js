const mongoose = require('mongoose');

// Local mongodb URI
const mongoURI = "mongodb://localhost:27017/fortnite";

// Connect mongoose to the local mongodb
mongoose
    .connect(mongoURI, { useNewUrlParser: true,  useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

// Export mongoose
module.exports = { mongoose };