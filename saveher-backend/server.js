const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connect
mongoose.connect("mongodb://127.0.0.1:27017/saveherDB")
  .then(() => console.log("✅ MongoDB Connected — SaveHer DB"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Test route
app.get("/", (req, res) => res.json({ status: "SaveHer Backend Running 💖", version: "2.0" }));

// Routes
const contactRoute = require("./routes/Contact");
const reportRoute = require("./routes/Report");
app.use("/api", contactRoute);
app.use("/api", reportRoute);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));