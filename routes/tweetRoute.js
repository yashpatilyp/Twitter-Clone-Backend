import express from 'express';
import { createTweet, deleteTweet, getAllTweets, getFollowingTweets, likeOrDislike, addComments, deleteComment, getUserTweets, likeOrDislikeComment, replyOnComment, deleteCommentonReply, likeOrDislikeCommentOnCommentId, retweetByTweetId, retweetByReplyId } from '../controllers/tweetController.js';
import isAuthenticated from '../config/auth.js';
import multer from 'multer'
// Multer configuration
const storage = multer.memoryStorage(); // Using memory storage for handling files
const upload = multer({ storage: storage });

const router = express.Router();

router.route('/create').post(isAuthenticated ,upload.single('picture'),createTweet)
router.route('/delete').delete(isAuthenticated,deleteTweet)
router.route('/like/:id').put(isAuthenticated,likeOrDislike)
router.route('/getalltweets/:id').get(isAuthenticated,getAllTweets)
router.route('/getUserTweet/:id').get(isAuthenticated,getUserTweets)
router.route('/getfollwingtweets/:id').get(isAuthenticated,getFollowingTweets);
router.route('/:id/reply').put(isAuthenticated,addComments);
router.route('/deleteComment').delete(isAuthenticated,deleteComment);
router.put('/tweet/:tweetId/comment/:commentId',isAuthenticated, likeOrDislikeComment);
router.put('/addCommentOnReply/:replyId',isAuthenticated, replyOnComment);
router.delete('/deleteCommentOnReply/:commentId',isAuthenticated, deleteCommentonReply)
router.post('/reply/:replyId/comment/:commentId',isAuthenticated, likeOrDislikeCommentOnCommentId);
router.put('/retweet/:tweetId',isAuthenticated, retweetByTweetId);
router.put('/reply/:replyId',isAuthenticated, retweetByReplyId);
export default router;