const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String },
  referralCode: { type: String, unique: true }, // Unique code for each user
  referredBy: { type: String }, // Stores who referred this user
  referralCount: { type: Number, default: 0 }, // Track number of people referred by this user
  bonus: { type: Number, default: 0 }, // Referral bonus
  referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // naya add kiya h
});

module.exports = mongoose.model("User", userSchema);
