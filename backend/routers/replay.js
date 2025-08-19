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

// GET /replay => call replay from database
router.get("/", async (req, res) => {
  try {
    const replays = await Replay.find().sort({ createdAt: -1 }); // to sort desc
    res.json(replays);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch replays" });
  }
});

module.exports = router;
