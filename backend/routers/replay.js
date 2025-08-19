const express = require("express");
const mongoose = require("mongoose");
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

// DELETE /replay/:id => delete replay
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) // check if not a id in mongoDB return err
    return res.status(400).json({ error: "Invalid id" });

  try {
    const item = await Replay.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ error: "Replay not found" });
    res.json({ ok: true, deletedId: id }); // if all valid  return ok=true
  } catch (err) {
    console.error("Error deleting replay:", err);
    res.status(500).json({ error: "Failed to delete replay" });
  }
});

module.exports = router;
