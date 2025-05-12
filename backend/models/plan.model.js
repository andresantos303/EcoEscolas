const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  associatedActivities: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
  ],
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String },
  resources: { type: String },
  level: { type: String },
  createdUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model('Plan', planSchema);
