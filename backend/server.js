const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const replayRoute = require("./routers/replay");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use("/replay", replayRoute);

app.listen(process.env.PORT || 8081, () =>
  console.log(`Server running at PORT:${process.env.PORT || 8081}`)
);
