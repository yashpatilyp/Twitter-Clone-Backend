import mongoose from "mongoose";

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
    ref: "User",
    required: true
  },
  userDetails: Object,
  replies: [{
    content: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
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
    }
  }]
}, { timestamps: true });

export const Tweet = mongoose.model('Tweet', tweetSchema);
