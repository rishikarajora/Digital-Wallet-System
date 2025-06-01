const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/auth'); // hum yeh file next banayenge


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Register & Login yaha handle honge

app.get('/', (req, res) => {
  res.send('Hello! Wallet system is running.');
});

// MongoDB Connection
console.log("MONGO_URI from .env =>", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});



  