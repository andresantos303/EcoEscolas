const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    associatedActivities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    ],
    data_inicio: { type: String, required: true },
    data_fim: { type: String, required: true },
    estado: { type: Boolean, required: true, default: false },
    recursos: { type: String, required: true },
    nivel: { type: Number, required: true },
    createdUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Plan", planSchema);
