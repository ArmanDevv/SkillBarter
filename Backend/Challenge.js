// Challenge.js
import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  challenger: { type: String, required: true }, // challenger's email
  recipient: { type: String, required: true },  // recipient's email
  challengeType: { type: String, required: true }, // e.g., 'steps'
  date: { type: Date, default: Date.now },
  steps : {type : Number , required : true} ,
  tokens : {type : Number , required : true},
  notifications : {type : String},
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'completed' , 'ongoing'],
    default: 'pending',
  } // pending, accepted, declined
});

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
