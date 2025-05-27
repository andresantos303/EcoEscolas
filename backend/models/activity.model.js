const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    local: { type: String, required: true },
    estado: { type: Boolean, required: true },
    fotos: [{ type: String, required: true }],
    data: { type: String, required: true },
    planActivitiesId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    createdUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: {
      type: [
        {
          nome: { type: String, required: true },
          email: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Activity", activitySchema);
