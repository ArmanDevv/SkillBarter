import express from "express";
import User from "./User.js";
import cors from "cors";
import fetch from "node-fetch";
import mongoose from 'mongoose';
import Challenge from "./Challenge.js";

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
// Modify the save-fitness-data endpoint in server.js
app.post('/save-fitness-data', async (req, res) => {
  const { email, steps, calories, name } = req.body;

  try {
    let user = await User.findOne({ email });
    
    // Calculate tokens
    const stepsTokens = Math.floor(steps / 1000) * 10;
    const caloriesTokens = Math.floor(calories / 500) * 10;
    const todayTokens = stepsTokens + caloriesTokens;

    if (user) {
      // Update existing user
      const oldTodayTokens = user.todayTokens || 0;
      user.steps = steps;
      user.calories = calories;
      user.name = name;
      user.todayTokens = todayTokens;
      
      // Only add to totalTokens if today's tokens have increased
      if (todayTokens > oldTodayTokens) {
        user.totalTokens = (user.totalTokens || 0) + (todayTokens - oldTodayTokens);
      }
    } else {
      // Create new user
      user = new User({
        name,
        email,
        steps,
        calories,
        todayTokens,
        totalTokens: todayTokens
      });
    }

    await user.save();
    res.status(200).json({ 
      message: 'User data saved successfully!',
      todayTokens,
      totalTokens: user.totalTokens
    });
  } catch (error) {
    console.error('Error saving fitness data:', error);
    res.status(500).json({ error: 'Failed to save fitness data' });
  }
});

  app.get('/user-tokens/:email', async (req, res) => {
    try {
      const user = await User.findOne({ email: req.params.email });
      if (user) {
        res.json({
          todayTokens: user.todayTokens || 0,
          totalTokens: user.totalTokens || 0
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tokens' });
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

app.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find().sort({ steps: -1 });

    // Assign ranks based on sorted order
    const leaderboard = users.map((user, index) => ({
      name: user.name,  // Show name instead of email
      email: user.email, // Keep email (for frontend identification)
      steps: user.steps,
      calories: user.calories,
      rank: index + 1
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Add this to your server.js
app.post('/update-location', async (req, res) => {
  const { email, latitude, longitude } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.latitude = latitude;
      user.longitude = longitude;
      await user.save();
      res.status(200).json({ message: 'Location updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Add this endpoint to get players' locations
app.get('/players-location', async (req, res) => {
  try {
    const users = await User.find({
      latitude: { $exists: true },
      longitude: { $exists: true }
    });
    
    console.log('Found users with location:', users.length);
    
    const playersLocation = users.map(user => ({
      email: user.email,
      name: user.name,
      latitude: user.latitude,
      longitude: user.longitude,
      steps: user.steps,
      calories: user.calories,
      profilePicture: user.profilePicture
    }));
    
    console.log('Sending players location:', playersLocation);
    res.json(playersLocation);
  } catch (error) {
    console.error('Error fetching players location:', error);
    res.status(500).json({ error: 'Failed to fetch players location' });
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
app.post('/challenge', async (req, res) => {
  const { challenger, recipient, challengeType, date ,steps , tokens } = req.body;

  try {
    // Check if there's already a pending challenge between these users
    const existingChallenge = await Challenge.findOne({
      $or: [
        { challenger, recipient, status: 'pending' },
        { challenger: recipient, recipient: challenger, status: 'pending' }
      ]
    });

    if (existingChallenge) {
      return res.status(400).json({ 
        error: 'A pending challenge already exists between these users' 
      });
    }

    const newChallenge = new Challenge({
      challenger,
      recipient,
      challengeType,
      date,
      steps,
      tokens,
      status: 'pending'
    });

    await newChallenge.save();
    res.status(201).json({ 
      message: 'Challenge created successfully!', 
      challenge: newChallenge 
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

app.get('/pending-challenges/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const pendingChallenges = await Challenge.find({
      $or: [
        { challenger: email, status: 'pending' },
        { recipient: email, status: 'pending' }
      ]
    });
    res.json(pendingChallenges);
  } catch (error) {
    console.error('Error fetching pending challenges:', error);
    res.status(500).json({ error: 'Failed to fetch pending challenges' });
  }
});

// Route to get incoming challenges for a specific user
app.get('/incoming-challenges/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const challenges = await Challenge.find({ recipient: email, status: 'pending' });
    res.status(200).json(challenges);
  } catch (error) {
    console.error('Error fetching incoming challenges:', error);
    res.status(500).json({ error: 'Failed to fetch incoming challenges' });
  }
});


app.listen(5000, () => console.log('Server running on port 5000'));
