const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  area: { type: String },
  status: { type: String },
  photos: [{ type: String }],
  date: { type: Date },
  planActivitiesId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  createdUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [{ type: String }], // ou ref: 'User' se quiseres refs
});

module.exports = mongoose.model('Activity', activitySchema);