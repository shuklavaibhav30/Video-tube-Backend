import { Router } from "express";

import{
    toggleVideoLike,toggleTweetLike,toggleCommentLike,getLikedVideos
} from "../controllers/like.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router()
router.use(verifyJWT)


router.route("/v/:videoId").patch(toggleVideoLike)
router.route("/t/:tweetId").patch(toggleTweetLike)
router.route("/c/:commentId").patch(toggleCommentLike)
router.route("/videos").get(getLikedVideos)

export default router
