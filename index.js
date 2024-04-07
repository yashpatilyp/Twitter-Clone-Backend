import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import databaseConnection from './config/database.js';
import cookieParser from 'cookie-parser';
import userRoute from './routes/userRoute.js';
import tweetRoute from './routes/tweetRoute.js';

dotenv.config({
    path: '.env'
});

databaseConnection();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Add CORS middleware

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://twitter-clone-frontend-sandy.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/tweet", tweetRoute);

// Start the server and listen on the specified port
const port = process.env.PORT || 3000; // Default port is 3000 if PORT is not set in .env
app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});
