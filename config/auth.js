import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { User } from '../models/userSchema.js';
dotenv.config({
    path:"../config/.env"
});
// Middleware function to verify user authentication
const isAuthenticated = (req, res, next) => {
    // Extract the 'authorization' header from the request
    const { authorization } = req.headers;
  
    // Check if 'authorization' header is missing
    if (!authorization) {
      return res.status(401).json({ error: "User not logged in" });
    }
  
    // Extract the token from the 'authorization' header
    const token = authorization.replace("Bearer ", "");
  
    // Verify the JWT token using the secret key
    jwt.verify(token, "nefrhu5454k3fgertrehfh5erg", (error, payload) => {
      // Check if there's an error during token verification
      if (error) {
        return res.status(401).json({ error: "User not logged in" });
      }
  
      // Extract the user ID from the payload
      const { _id } = payload;
  
      // Find the user in the database using the extracted ID
      User.findById(_id)
        .then((dbUser) => {
          // Attach the user object to the request for further use in the route handler
          req.user = dbUser;
          // Continue to the next middleware or route handler
          next();
        })
        .catch((err) => {
          // Handle database errors
          console.error("Error finding user:", err);
          res.status(500).json({ error: "Internal Server Error" });
        });
    });
  };
  

  export default isAuthenticated;