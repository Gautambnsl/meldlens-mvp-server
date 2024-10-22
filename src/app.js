const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alert');
const cors = require("cors");
const { initializeAlerts } = require('./middleware/initAlert');


dotenv.config();

const app = express();
app.use(express.json());
//Allow requests from http://localhost:3001
app.use(cors());
app.options("*", cors()); // Pre-flight request handling for all routes

app.use('/api/auth', authRoutes);
app.use('/api/alert', alertRoutes);



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeAlerts();
});


console.log("String is ->>>>>>>>>>>>>>>>>>>",process.env.MONGO_URI)