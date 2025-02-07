import express from "express";
import User from "./User.js";
import cors from "cors";
import fetch from "node-fetch";
import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();


const MONGO_URI = 'mongodb+srv://fitquestuser:fitquest123@fitquestcluster.5sa9h.mongodb.net/?retryWrites=true&w=majority&appName=FitQuestCluster';
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

const app = express();
app.use(cors());
app.use(express.json());

const YOUR_GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const YOUR_GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const YOUR_REDIRECT_URI = 'http://localhost:5175';

// Add the new route to save the user data
app.post('/save-fitness-data', async (req, res) => {
    const { email, steps, calories } = req.body; // Get email, steps, and calories from the request body
  
    try {
      // Check if the user already exists
      let user = await User.findOne({ email });
  
      if (user) {
        // If the user exists, update the existing record
        user.steps = steps;
        user.calories = calories;
      } else {
        // If the user doesn't exist, create a new record
        user = new User({
          email,
          steps,
          calories,
        });
      }
  
      // Save the user data in MongoDB
      await user.save();
  
      res.status(200).json({ message: 'User data saved successfully!' });
    } catch (error) {
      console.error('Error saving fitness data:', error);
      res.status(500).json({ error: 'Failed to save fitness data' });
    }
  });
  

// Exchange Auth Code for Tokens
app.post('/exchange-code', async (req, res) => {
  try {
    const { code } = req.body;
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: YOUR_GOOGLE_CLIENT_ID,
        client_secret: YOUR_GOOGLE_CLIENT_SECRET,
        redirect_uri: YOUR_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();
    console.log('Token Exchange Data:', data); // For debugging
    res.json(data);
  } catch (error) {
    console.error('Error exchanging code:', error);
    res.status(500).json({ error: 'Failed to exchange auth code' });
  }
});

// Refresh Access Token
app.post('/refresh-token', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token,
        client_id: YOUR_GOOGLE_CLIENT_ID,
        client_secret: YOUR_GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    console.log('Refresh Token Data:', data); // For debugging
    res.json(data);
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
