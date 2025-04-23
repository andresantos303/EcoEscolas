import mongoose from "mongoose";

const executionSchema = new mongoose.Schema({
  planActivitiesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity",
    required: true,
  },
  createdUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
  photos: [{ type: String }],
  comments: [{ type: String }],
});

export default mongoose.model("Execution", executionSchema);
