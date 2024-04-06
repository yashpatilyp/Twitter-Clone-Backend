import mongoose from 'mongoose';

const tweetSchema = new mongoose.Schema({
  description: {
    type: String
  },
  picture: {
    type: String
  },
  like: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model and 'User' is the name of the model
    required: true
  },
  userDetails: Object,
  replies: [{
    content: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Assuming you have a User model and 'User' is the name of the model
    },
    profilepicture: String,
    username: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: []
    },
    dislikes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: []
    },
    comments: [{
      content: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      profilepicture: String,
      username: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }],
      dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }]
    }]
  }]
}, { timestamps: true });

export const Tweet = mongoose.model('Tweet', tweetSchema);
