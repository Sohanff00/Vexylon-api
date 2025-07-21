const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    enum: ["demo", "live"],
    default: "demo",
  },
  currency: {
    type: String,
    enum: ["USD", "EUR", "BDT"],
    default: "USD",
  },
  demoBalance: {
    type: Number,
    default: 10000,
  },
  liveBalance: {
    type: Number,
    default: 0,
  },
  profit: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("User", userSchema);
