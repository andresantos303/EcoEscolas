const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: String, required: true },
    creationDate: { type: Date, default: Date.now },
    associatedActivities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    ],
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
