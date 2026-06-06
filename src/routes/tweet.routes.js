import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    getAllTweets,
    updateTweets,
    deleteTweets
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router()



router.use(verifyJWT)

router.route("/").get(getAllTweets).post(createTweet)
router.route("/user/:userId").get(getUserTweets)
router.route("/tweet/:tweetId").patch(updateTweets).delete(deleteTweets)

export default router
