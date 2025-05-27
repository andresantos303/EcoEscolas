const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    createdUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, default: Date.now },
    titulo: { type: String, required: true },
    corpo: { type: String, required: true },
    associatedRoles: { type: Array, required: true },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
