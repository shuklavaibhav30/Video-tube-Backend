import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment

} from "../controllers/comment.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getOptionalUser } from "../middlewares/optionalAuth.middleware.js";

const router=Router();
//router.use(verifyJWT);//        Apply verifyJWT middleware to all routes in this file


router.route("/:videoId").get(getOptionalUser,getVideoComments).post(verifyJWT,addComment)
router.route("/c/:commentId").delete(verifyJWT,deleteComment).patch(verifyJWT,updateComment);

export default router