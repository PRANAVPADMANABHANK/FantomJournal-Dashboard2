const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require('./routes/authRoutes'); // Import the routes


dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies


const CONNECTION_STRING = process.env.MONGO_URI; // Use the environment variable

// Mongoose connection
mongoose.connect(CONNECTION_STRING)
    .then(() => console.log("Mongoose connected successfully"))
    .catch((error) => console.error("Mongoose connection failed:", error));
 
app.listen(5040, () => {
    console.log("Server is running on port 5040");
});



app.use('/api', authRoutes); // Use the auth routes 