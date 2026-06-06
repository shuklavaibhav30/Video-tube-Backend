import mongoose,{isValidObjectId} from "mongoose";
import {Tweet} from "../models/tweet.model.js";
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTweet=asyncHandler(async(req,res)=>{
    //create a tweet
    const {content}=req.body
    const userId=req.user?._id
    if(!content) throw new ApiError(400,"User Tweet cannot be empty!")
    const tweet=await Tweet.create({
        content,
        owner:userId
    })
    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet created!!!"))
})

const getUserTweets=asyncHandler(async(req,res)=>{
    //get the user Tweets

    const {userId}=req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"UserId not found!!!")
    }

    const userTweets=await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"users",
                foreignField:"_id",
                localField:"owner",
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
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likes"
            }
        },
        {
            $addFields:{
                likesCount:{$size:"$likes"}
            }
        },{
            $project:{
                content:1,
                owner:1,
                likesCount:1,
                createdAt:1
            }
        }

    ])

    if(!userTweets.length){
        return res.status(200).json(new ApiResponse(200,[],"No tweets found for this user!!!"))
    }

    return res
    .status(200)
    .json(new ApiResponse(200,userTweets,"User Tweets Fetched!"))

    
})

const updateTweets=asyncHandler(async(req,res)=>{
    //update tweets
    const {tweetId}=req.params
    const{newTweet}=req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Tweet is invalid!")
    }

    if(!newTweet) throw new ApiError(400,"New Tweet cannot be empty!")
    const tweet=await Tweet.findByIdAndUpdate(
        tweetId,
        {$set:{content:newTweet}},{new:true}
    )
    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"User Tweet Updated!"))


})

const deleteTweets=asyncHandler(async(req,res)=>{
    //to delete tweets

    const {tweetId}=req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid Tweet!")

    }

    await Tweet.findByIdAndDelete(tweetId);
    return res
    .status(200)
    .json(new ApiResponse(200,{},"User Tweet Deleted!"))
})


export{
    createTweet,
    getUserTweets,
    updateTweets,
    deleteTweets
}