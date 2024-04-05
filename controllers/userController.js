import { User } from "../models/userSchema.js";
import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config({
  path:"../controllers/.env"
})

export const Register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status({
        message: "All fields must be required",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "User with this Email already exist",
        success: false,
      });
    }
    const dbusername = await User.findOne({ username });
    if (dbusername) {
      return res.status(401).json({
        message: "username already exist",
        success: false,
      });
    }
    const hashedPassword = await bcryptjs.hash(password, 16);

    await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    return res.status(200).json({
      message: "Account created successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

//........................{update profile }.........................

export const UpdateProfile = async (req, res) => {
  try {
    const { name, dob, location, profilepicture, bio } = req.body;
    console.log("Request Body:", req.body); // Log the request body for debugging
    const userId = req.params.id; // Assuming user ID is passed as a route parameter
    
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }

    // Update the user's profile fields if provided in the request body
    if (name) user.name = name;
    if (dob) user.dob = dob;
    if (location) user.location = location;
    if (profilepicture) user.profilepicture = profilepicture;
    if (bio) user.bio = bio;

    // Save the updated user object
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: user // Send back the updated user object in the response
    });
  } catch (error) {
    console.log("Error updating profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
};

//.......................{ Login }..................................
export const Login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(401).json({
        message: 'All fields are required',
        success: false
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid username', // Specific message for invalid username
        success: false
      });
    }

    const didMatch = await bcryptjs.compare(password, user.password);

    if (!didMatch) {
      return res.status(401).json({
        message: 'Invalid password', // Specific message for invalid password
        success: false
      });
    }

    // If the passwords match, generate a JWT token for authentication
    const jwtToken = jwt.sign({ _id: user._id }, "nefrhu5454k3fgertrehfh5erg");
    // Extract relevant user information for the response
    const userInfo = {  email: user.email, 
      name: user.name, 
      username: user.username, 
      _id: user._id,
      followers: user.followers,
      following: user.following,
      bookmarks: user.bookmarks,
    dob:user.dob,
  location: user.location,
profilepicture: user.profilepicture};
      

    res.status(200).json({ result: { token: jwtToken, user: userInfo } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//...............{ bookmark }.......................................
export const bookmarks = async (req, res) => {
  try {
    const loggedInUserId = req.body.id;
    const tweetId = req.params.id;

    const user = await User.findById(loggedInUserId);

    if (user.bookmarks.includes(tweetId)) {
      // Remove bookmark
      await User.findByIdAndUpdate(loggedInUserId, { $pull: { bookmarks: tweetId } });
      return res.status(200).json({
        message: "Removed From Bookmarks",
      });
    } else {
      // Bookmark
      await User.findByIdAndUpdate(loggedInUserId, { $push: { bookmarks: tweetId } });
      return res.status(200).json({
        message: "Saved to Bookmark",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


//..................{ get my profile }..................................


export const getMyProfile = async (req, res) => {
   try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");
    return res.status(200).json({
      user,
    })
    
   } catch (error) {
    console.log(error);
   }
}
 
//....................{ get Other Users}....................................

export const getOtherUsers =async (req, res) =>{
  try {
    const {id}=req.params;
    const otherUsers = await User.find({_id:{$ne:id}}).select("-password");
 if(!otherUsers){
  return res.status(401).json({
    message:"current user not found",
    success:false
  })
 };
 return res.status(200).json({
  otherUsers
})
    
  } catch (error) {
    console.log(error);
  }
}


//......................{ Follow   }..................................

export const follow = async(req, res)=>{
  try {
    const loggedInUserId= req.body.id;
    const userId = req.params.id;

    const loggedInUser = await User.findById(loggedInUserId);
    const user = await User.findById(userId);

    if(!user.followers.includes(loggedInUserId)){
      await user.updateOne({$push:{followers:loggedInUserId}});
      await loggedInUser.updateOne({$push:{following:userId}});
    }else{
      return res.status(400).json({
        message:`user already followed to ${user.name}`
      })
    }
    return res.status(200).json({
      message:`${loggedInUser.name} just follow ${user.name}`,
      success:true
    })
    
  } catch (error) {
    console.log(error)
  }
}


//.................. { unfollow }............................................

 
export const unfollow = async(req, res)=>{
  try {
    const loggedInUserId= req.body.id;
    const userId = req.params.id;

    const loggedInUser = await User.findById(loggedInUserId);
    const user = await User.findById(userId);

    if(loggedInUser.following.includes(userId)){
      await user.updateOne({$pull:{followers:loggedInUserId}});
      await loggedInUser.updateOne({$pull:{following:userId}});
    }else{
      return res.status(400).json({
        message:`user has not followed yet`
      })
    }
    return res.status(200).json({
      message:`${loggedInUser.name} just unfollow ${user.name}`,
      success:true
    })
    
  } catch (error) {
    console.log(error)
  }
}