const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
require("dotenv").config();
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

// Serve arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Rotas da API
app.use("/users", require("./routes/users.routes.js"));
app.use("/plans", require("./routes/plans.routes.js"));
app.use('/activities', require('./routes/activities.routes.js'));

// Middleware de erro
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON payload! Check if your body data is a valid JSON." });
  }
  res.status(err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
module.exports = app;

if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅  MongoDB conectado');
      app.listen(PORT, () =>
        console.log(`🚀 Servidor a ouvir em http://localhost:${PORT}`)
      );
    } catch (err) {
      console.error('❌ Erro ao conectar ao MongoDB:', err);
      process.exit(1);
    }
  })();
}
