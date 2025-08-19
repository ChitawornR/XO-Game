const mongoose = require("mongoose");

const moveSchema = new mongoose.Schema({
  row: Number,
  col: Number,
  player: {
    type: String,
    enum: ["X", "O"],
    required: true
  }
}, { _id: false });

const replaySchema = new mongoose.Schema({
  size: {
    type: Number,
    required: true
  },
  winner: {
    type: String,
    enum: ["X", "O"],
    default: null
  },
  moves: {
    type: [moveSchema],
    required: true
  },
  isSinglePlayer:{
    type:Boolean,
    required:true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Replay = mongoose.model("Replay", replaySchema);

module.exports = Replay;
