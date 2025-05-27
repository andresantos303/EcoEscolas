const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

//routers
app.use("/users", require("./routes/users.routes.js"));
app.use("/plans", require("./routes/plans.routes.js"));
app.use("/activities", require("./routes/activities.routes.js"));
app.use("/notifications", require("./routes/notifications.routes.js"));

// middleware de erro
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({message:"Invalid JSON payload! Check if your body data is a valid JSON.",});
  }
  res.status(err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

// envolve a ligação e o listen num IIFE async
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅  MongoDB conectado");

    app.listen(PORT, () =>
      console.log(`🚀  Servidor a ouvir em http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  }
})();
