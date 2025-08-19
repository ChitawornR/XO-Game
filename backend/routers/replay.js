const express = require("express");
const Replay = require("../models/Replay");
const router = express.Router();

// POST /replay => save to database
router.post("/", async (req, res) => {
  try {
    const { size, winner, moves, isSinglePlayer } = req.body;
    const newReplay = new Replay({ size, winner, moves, isSinglePlayer });
    const saved = await newReplay.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving replay:", err);
    res.status(500).json({ error: "Failed to save replay" });
  }
});

module.exports = router;
