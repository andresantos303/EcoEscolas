const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  createdUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
  body: { type: String, required: true },
  associatedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model('Notification', notificationSchema);