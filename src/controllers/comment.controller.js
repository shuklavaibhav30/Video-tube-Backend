import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

//getVideoComents,addComment,deleteComment,updateComment

const getVideoComments = asyncHandler(async (req, res) => {
    //to get all comments of a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Video not found")

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]

            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: [
                        { $in:[req.user?._id,"$likes.likedBy"] },
                        true,
                        false
                    ]
                }
            }
        }, {
            $project: {
                content: 1,
                owner: 1,
                likesCount: 1,
                isLiked: 1,
                createdAt: 1
            }
        }
    ]

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const allComments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options)

    return res.status(200)
        .json(new ApiResponse(200, allComments, "All Comments for the video!"))
})


const addComment = asyncHandler(async (req, res) => {
    // add comment to a video
    const { content } = req.body
    const { videoId } = req.params

    if (!content) throw new ApiError(400, "Enter Comment!")
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Video not found")

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment created!!!"))
})

const updateComment = asyncHandler(async (req, res) => {
    //update a comment
    const { newcontent } = req.body
    const { commentId } = req.params

    if (!newcontent) {
        throw new ApiError(400, "User Comment is Empty!")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID!")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content: newcontent } }, { new: true }
    )

    if (!comment) {
        throw new ApiError(404, "Comment not found!")
    }

    return res.status(200)
        .json(new ApiResponse(200, comment, "Comment Updated!"))

})

const deleteComment = asyncHandler(async (req, res) => {
    //delete a comment

    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID!")
    }
    const comment = await Comment.findByIdAndDelete(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found!")
    }

    return res.status(200)
        .json(new ApiResponse(200, {}, "Comment Deleted!"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment

}