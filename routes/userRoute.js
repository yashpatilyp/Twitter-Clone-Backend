import express from 'express';
import { ForgotPassword, Login, Register, Reset, UpdateProfile, bookmarks, fetchBookmarkedTweets, follow, getMyProfile, getOtherUsers, unfollow } from '../controllers/userController.js';
import isAuthenticated from '../config/auth.js';



const router = express.Router();

router.route("/register").post(Register);
router.route("/login").post(Login)

router.route("/bookmark/:id").put(isAuthenticated, bookmarks)
router.route("/profile/:id").get(isAuthenticated,getMyProfile)
router.route("/otheruser/:id").get(isAuthenticated,getOtherUsers)
router.route("/follow/:id").post(isAuthenticated,follow)
router.route("/unfollow/:id").post(isAuthenticated,unfollow)
router.route("/update-profile/:id").put(isAuthenticated,UpdateProfile)

router.get('/users/:userId/bookmarks', fetchBookmarkedTweets);
router.route("/forgot-password").post(ForgotPassword)
router.route("/reset-password").post(Reset)
export default router;