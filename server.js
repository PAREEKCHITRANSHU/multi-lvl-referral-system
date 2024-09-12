const express = require('express');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();


//cors
//app.use(cors());


app.use(cors({
  origin: 'https://mlmsystem-k02mrnfqf-chitranshu-pareeks-projects.vercel.app', // Replace with the domain of your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  credentials: true, // If you’re using cookies or other authentication methods
}));
// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Server start
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
