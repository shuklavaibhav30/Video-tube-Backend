import { Router } from "express";
import {
    getAllVideos,
    publishVideo,
    updateVideo,
    getVideoById,
    deleteVideo,
    togglePublishStatus

} from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


// router.route("/")
// .get(getAllVideos)
// .post(
//     upload.fields([
//         { name:"videoFile",maxCount:1},
//         { name:"thumbnail",maxCount:1}
//     ]),
//     publishVideo
// )

// router.route("/:videoId")
// .get(getVideoById)
// .patch(updateVideo)
// .delete(deleteVideo)

router.route("/").get(getAllVideos)
router.route("/:videoId").get(getVideoById)
// All the following routes require authentication
router.use(verifyJWT)
router.route("/").post(
    upload.fields([
        { name:"videoFile",maxCount:1},
        { name:"thumbnail",maxCount:1}
    ]),
    publishVideo
)

router.route("/:videoId").patch(updateVideo).delete(deleteVideo)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default router

