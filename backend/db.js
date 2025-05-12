// db.js – ES Modules
import mongoose from 'mongoose';
import 'dotenv/config';

// Conexão com o MongoDB
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅  MongoDB conectado');
  } catch (err) {
    console.error('Erro ao ligar ao MongoDB:', err);
    process.exit(1);// Encerra a app se falhar a ligação
  }
}
