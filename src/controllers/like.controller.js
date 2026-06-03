import mongoose,{isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params

    //toggle like on a video
    if(!isValidObjectId(videoId)){
         throw new ApiError(400,"Invalid Video id!")
    }
    
    const existingLike=await Like.findOne({
        video:videoId,
        likedBy:req.user?._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(new ApiResponse(200,{isLiked:false},"Video Unliked!"))
    }

    await Like.create({
        video:videoId,
        likedBy:req.user?._id
        
    })
    return res
        .status(200)
        .json(new ApiResponse(200,{isLiked:true},"Video Liked!"))
    
})

const toggleCommentLike=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    //toggle like on a comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment Id")
    }

    const existingLike=await Like.findOne({
        comment:commentId,
        likedBy:req.user?._id
    })
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200)
        .json(new ApiResponse(200,{isLiked:false},"Comment Unliked!"))
    }
    await Like.create({
        comment:commentId,
        likedBy:req.user?._id
    })
    return res.status(200)
    .json(new ApiResponse(200,{isLiked:true},"Comment Liked!"))
})

const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params
    //toggle like on a tweet

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid Tweet ID")
    }

    const existingLike=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user?._id
    })
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200)
        .json(new ApiResponse(200,{isLiked:false},"Tweet Unliked!"))
    }

    await Like.create({
        tweet:tweetId,
        likedBy:req.user?._id
    })
    return res
    .status(200)
    .json(new ApiResponse(200,{isLiked:true},"Tweet Liked!"))
})

const getLikedVideos=asyncHandler(async(req,res)=>{
    //to get all liked videos

    const LikedVideos=await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user?._id),
                video:{$exists:true,$ne:null}
            }
            
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    },
                    {
                        $project:{
                            title:1,
                            thumbnail:1,
                            views:1,
                            duration:1,
                            owner:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                video:{
                    $first:"$video"
                }
            }
        },
        {
            $project:{
                video:1,
                likedBy:1
            }
        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,LikedVideos,"Liked Videos fetched successfully!"))

})

export{
    toggleVideoLike,toggleTweetLike,toggleCommentLike,getLikedVideos
}   