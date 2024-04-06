import {Tweet} from '../models/tweetSchema.js'
import { User } from '../models/userSchema.js';
import multer from 'multer'

import { v2 as cloudinary } from 'cloudinary';



// Configure Cloudinary
cloudinary.config({
     cloud_name: 'dfm5wkzjq',
     api_key: '879614853226467',
     api_secret: 'tt9BH-pT4vVCUvbWGuePJL0p6e0'
   });
   
   export const createTweet = async (req, res) => {
     try {
       const { description, id } = req.body;
   
       // Check if description and user ID are provided
       if (!description || !id) {
         return res.status(400).json({ message: 'Description and user ID are required' });
       }
   
       let pictureUrl = ''; // Default empty URL for picture
   
       // Check if picture is uploaded
       if (req.file) {
         const fileBuffer = req.file.buffer;
         const fileDataUri = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
         // Upload image to Cloudinary
         const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
           folder: 'tweet_images'
         });
         pictureUrl = uploadResult.url;
       }
   
       // Find user by ID
       const user = await User.findById(id).select('-password');
       if (!user) {
         return res.status(404).json({ message: 'User not found' });
       }
   
       // Create new tweet
       const tweet = await Tweet.create({
         description,
         userId: id,
         userDetails: user,
         
         picture: pictureUrl, // Assign the URL whether it's empty or contains the uploaded image URL
       });
   console.log(tweet)
       return res.status(201).json({ message: 'Tweet created successfully', tweet });
     } catch (error) {
       console.error(error);
       return res.status(500).json({ message: 'Internal server error' });
     }
   };
   

//.............. { delete tweet }.....................................

export const deleteTweet = async (req, res) => {
     try {
         const { id } = req.body;
         const deletedTweet = await Tweet.findByIdAndDelete(id);
         
         if (!deletedTweet) {
             return res.status(404).json({
                 message: 'Tweet not found',
                 success: false
             });
         }
         
         return res.status(200).json({
             message: 'Tweet deleted successfully',
             success: true
         });
     } catch (error) {
         console.log(error);
         return res.status(500).json({
             message: 'Internal server error',
             success: false
         });
     }
 }

//...............{ like or dislike }.......................................


export const likeOrDislike = async (req, res) => {
         try {
          
          const loggedInUserId=req.body.id;
          const tweetId = req.params.id;

          const tweet = await Tweet.findById(tweetId);

          if(tweet.like.includes(loggedInUserId)) {
                    //dislike
                    await Tweet.findByIdAndUpdate(tweetId,{$pull:{like:loggedInUserId}});
                    return res.status(200).json({
                         message:"user disliked your tweet"     
                    })
          }else{
                    //like 
                    await Tweet.findByIdAndUpdate(tweetId,{$push:{like:loggedInUserId}});
                    return res.status(200).json({
                              message:"user liked your tweet"     
                         })
          }

         } catch (error) {
          console.log(error); 
          
         }
}

//......................{ get all tweets }.............................................


export const getAllTweets= async (req, res) => {
     //loggedinUser tweet + follwing user tweets
     try {
          const id = req.params.id;
          const loggedInUser = await User.findById(id);
          const loggedInUserTweets = await Tweet.find({userId:id});
          const follwingUserTweet = await Promise.all(loggedInUser.following.map((otherUserId)=>{
               return Tweet.find({userId:otherUserId});
          }));
          return res.status(200).json({
               tweets:loggedInUserTweets.concat(...follwingUserTweet)
          })
          
     } catch (error) {
          console.log(error);
          
     }
} 


//...........................{ get Following Tweets }.......................................

export const getFollowingTweets = async (req,res)=>{
     try {
         
          const id = req.params.id;
          const loggedInUser = await User.findById(id);
         
          const follwingUserTweet = await Promise.all(loggedInUser.following.map((otherUserId)=>{
               return Tweet.find({userId:otherUserId});
          }));
          return res.status(200).json({
               tweets:[].concat(...follwingUserTweet)
          })
 

     } catch (error) {
          console.log(error);
     }
}
//.................................{ logged in user tweets}.....................................

export const getUserTweets = async (req, res) => {
  try {
    const id = req.params.id;
    const loggedInUserTweets = await Tweet.find({ userId: id });
    return res.status(200).json({
      tweets: loggedInUserTweets
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyContent } = req.body;

    // Find the tweet by its ID
    const tweet = await Tweet.findById(id);

    // Check if the tweet exists
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    // Create the reply object
    const reply = {
      content: replyContent,
      userId: req.user._id,
      profilepicture: req.user.profilepicture, 
      createdAt: new Date(),
      username: req.user.username
    };

    // Add the reply object to the tweet's replies array
    tweet.replies.push(reply);
    await tweet.save();

    return res.status(201).json({ message: 'Reply created successfully', reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//................................. delete replies .........................................................
export const deleteComment = async (req, res) => {
  try {
    const { tweetId, replyId } = req.body;

    // Find the tweet by its ID
    const tweet = await Tweet.findById(tweetId);

    // Check if the tweet exists
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    // Find the index of the reply in the replies array
    const replyIndex = tweet.replies.findIndex(reply => reply._id.toString() === replyId);

    // Check if the reply exists
    if (replyIndex === -1) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check if the user is authorized to delete the reply
    if (tweet.replies[replyIndex].userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Remove the reply from the replies array
    tweet.replies.splice(replyIndex, 1);
    await tweet.save();

    return res.status(200).json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


//.................................{ Like/dislike comment }.............................................

export const likeOrDislikeComment = async (req, res) => {
  try {
    const loggedInUserId = req.body.id;
    const { tweetId, commentId } = req.params;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const comment = tweet.replies.find((reply) => reply._id.toString() === commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.likes.includes(loggedInUserId)) {
      // If the user has already liked the comment, remove the like
      await Tweet.findOneAndUpdate(
        { _id: tweetId, 'replies._id': commentId },
        { $pull: { 'replies.$.likes': loggedInUserId } }
      );
      return res.status(200).json({ message: 'User disliked the comment' });
    } else {
      // If the user hasn't liked the comment, add the like
      await Tweet.findOneAndUpdate(
        { _id: tweetId, 'replies._id': commentId },
        { $push: { 'replies.$.likes': loggedInUserId } }
      );
      return res.status(200).json({ message: 'User liked the comment' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
///.......................................................................................................................

export const replyOnComment = async(req, res) => {
  try {
    const { replyId } = req.params;
    const { commentContent } = req.body;

    // Find the tweet containing the reply by searching for the reply ID
    const tweetWithReply = await Tweet.findOne({ 'replies._id': replyId });

    // Check if the tweet containing the reply exists
    if (!tweetWithReply) {
      return res.status(404).json({ message: 'Tweet containing the reply not found' });
    }

    // Find the specific reply within the tweet
    const reply = tweetWithReply.replies.find(reply => reply._id.equals(replyId));

    // Check if the reply exists
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Create the comment object
    const comment = {
      content: commentContent,
      userId: req.user._id, // Assuming you have user authentication and req.user is available
      profilepicture: req.user.profilepicture, 
      createdAt: new Date(),
      username: req.user.username
    };

    // Add the comment object to the reply's comments array
    reply.comments.push(comment);
    await tweetWithReply.save();

    return res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }

}


//................................{ delete comment on reply }..................................................................

export const deleteCommentonReply = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Find the tweet containing the comment by searching for the comment ID
    const tweetWithComment = await Tweet.findOne({ 'replies.comments._id': commentId });

    // Check if the tweet containing the comment exists
    if (!tweetWithComment) {
      return res.status(404).json({ message: 'Tweet containing the comment not found' });
    }

    // Find the specific reply containing the comment within the tweet
    const replyContainingComment = tweetWithComment.replies.find(reply =>
      reply.comments.some(comment => comment._id.equals(commentId))
    );

    // Check if the reply containing the comment exists
    if (!replyContainingComment) {
      return res.status(404).json({ message: 'Reply containing the comment not found' });
    }

    // Find the specific comment within the reply
    const commentIndex = replyContainingComment.comments.findIndex(comment =>
      comment._id.equals(commentId)
    );

    // Check if the comment exists
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Remove the comment from the reply's comments array
    replyContainingComment.comments.splice(commentIndex, 1);
    await tweetWithComment.save();

    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//......................................................................................................................
export const likeOrDislikeCommentOnCommentId = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { replyId, commentId } = req.params;

    const tweetWithReply = await Tweet.findOne({ 'replies._id': replyId });

    if (!tweetWithReply) {
      return res.status(404).json({ message: 'Tweet containing the reply not found' });
    }

    const reply = tweetWithReply.replies.find(reply => reply._id.toString() === replyId);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const comment = reply.comments.find(comment => comment._id.toString() === commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const index = comment.likes.indexOf(loggedInUserId);
    if (index !== -1) {
      // If user has already liked the comment, remove the like
      comment.likes.splice(index, 1);
      await tweetWithReply.save();
      return res.status(200).json({ message: 'Comment disliked', liked: false });
    } else {
      // If user hasn't liked the comment, add the like
      comment.likes.push(loggedInUserId);
      await tweetWithReply.save();
      return res.status(200).json({ message: 'Comment liked', liked: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

