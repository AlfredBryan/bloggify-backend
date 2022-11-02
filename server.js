const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require("morgan");
require("dotenv").config();

const userRoutes = require("./routes/UserRoutes");
const PostRoutes = require("./routes/PostRoutes");

const app = express();

app.use(logger("dev"));

// Setting Headers
app.use(cors());

// Adding the body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/v1", userRoutes);
app.use("/api/v1", PostRoutes);

// Connecting to Database
mongoose.connect(
  "mongodb+srv://gist-fresh:Secure101@cluster0.0xmfc.mongodb.net/?retryWrites=true&w=majority",
  () => {
    console.log("Connected to MongoDB");
  }
);

// Setting the port
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`listening to port ${port}`);
});

module.exports = app;
