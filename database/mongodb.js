const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/fortnite";

mongoose
    .connect(mongoURI, { useNewUrlParser: true,  useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

module.exports = { mongoose };