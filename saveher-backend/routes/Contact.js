const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// GET all contacts
router.get("/contact", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new contact
router.post("/contact", async (req, res) => {
  const contact = new Contact({
    name: req.body.name,
    phone: req.body.phone,
    relation: req.body.relation || "Contact",
  });
  try {
    const saved = await contact.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE contact
router.delete("/contact/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update contact
router.put("/contact/:id", async (req, res) => {
  try {
    const updated = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;