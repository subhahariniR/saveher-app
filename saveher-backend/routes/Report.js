const express = require("express");
const router = express.Router();
const Report = require("../models/Report");

// GET reports by area
router.get("/report/:area", async (req, res) => {
  try {
    const reports = await Report.find({ area: req.params.area.toLowerCase() }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new report
router.post("/report", async (req, res) => {
  const report = new Report({
    area: req.body.area,
    text: req.body.text,
    time: req.body.time || new Date().toLocaleString(),
  });
  try {
    const saved = await report.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all reports
router.get("/report", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).limit(50);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;