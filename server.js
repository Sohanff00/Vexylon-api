const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// 🧠 Middleware: Body Parser
app.use(express.json());

// 🔐 Routes: Auth
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// 👤 Routes: User Info (UID, Email, Balance)
const userRoutes = require('./routes/user');
app.use('/api', userRoutes);

// 🌐 MongoDB Connect
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
