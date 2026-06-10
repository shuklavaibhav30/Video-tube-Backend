import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { Video } from "../models/video.model.js";
import {Tweet} from "../models/tweet.model.js";
import {Playlist} from "../models/playlist.model.js";
import {Like} from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import {Comment} from "../models/comment.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
}


const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return{accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh tokens");
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validation- not empty
    //check if user already exists: username, email
    //check for images(avatar) and upload to cloudinary
    //create user object -create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response


    const {fullName,username,email,password}=req.body       //req.body me sara data aata h
    console.log("email: ",email)
    // if (fullName==""){
    //     throw new ApiError(400,"fullname is required")
    // }
    if (
        [fullName,email,username,password].some((field)=>field?.trim()==="")//agr field ko trim krne pr null h
    ) {
        throw new ApiError(400,"All fields are compulsary")
    }
    const existedUser=await User.findOne({
        $or:[{ username },{ email }]//jitne chahe utne value check krlo
    })
    if(existedUser) throw new ApiError(409,"user with email or username already exists!!!")

    const avatarLocalPath=req.files?.avatar?.[0]?.path;
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path;
    console.log("req.files:", req.files);     
    console.log("avatarLocalPath:", avatarLocalPath);  
    if(!avatarLocalPath)    throw new ApiError(400,"Avatar file is required");
    //agr req.files ka access hai to (req.files?.)avatar ka naam yani vo web address check kro cloudinary se

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=coverImageLocalPath?await uploadOnCloudinary(coverImageLocalPath):null;
    if(!avatar) throw new ApiError(400,"Avatar file is required");

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering user")
    }
    
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created successfully")
    )
})

const loginUser=asyncHandler(async(req,res)=>{
    //req body->data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const{email,username,password}=req.body
    if(!(username||email)){
        throw new ApiError(400,"Username or email is required!")
    }

    const user=await User.findOne({
        $or:[{email},{username}]
    })
    if(!user) throw new ApiError(404,"User does not Exist");
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid)    throw new ApiError(401,"PASSWORD INCORRECT!!!");

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new ApiResponse(200,
            {
                user:loggedInUser,accessToken,
                refreshToken
            },"User logged in successfully!")
    )
    
    
    
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    return res
    .status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(new ApiResponse(200,{},"User logged Out successfully!"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken   //(if someone uses mobile)

    if (!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorized Token")
        
    }
try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
    
       const user=await User.findById(decodedToken?._id)
       if(!user){
        throw new ApiError(401,"Invalid Refresh Token")
       }
       if (incomingRefreshToken!=user?.refreshToken) {
        throw new ApiError(401,"REFRESH TOKEN IS EXPIRED OR USED!!!")
        
       }
    
       const{accessToken:newaccessToken,refreshToken:newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
       return res
       .status(200)
       .cookie("accessToken",newaccessToken,cookieOptions)
       .cookie("refreshToken",newrefreshToken,cookieOptions)
       .json(
        new ApiResponse(
            200,
            {
                accessToken:newaccessToken,refreshToken:newrefreshToken
            },
            "Access Token Refreshed!"
        )
       )
} catch (error) {
    throw new ApiError(401,error?.message||"Invalid refresh Token")
}
})


const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword}=req.body
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid Old Password")
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully!!!"))
})


const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"current User fetched successfully!!!"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{

    //files k liye alg endpoint and controllers rkhna hai for better practice
    const {fullName,email}=req.body

    if(!fullName||!email){
        throw new ApiError(400,"All fields are required")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            //MongoDB operators
            $set:{
                fullName:fullName,
                email:email
            }
        },{new:true}).select("-password")

        return res.status(200)
        .json(new ApiResponse(200,user,"Account DETAILS Updated successfully"))
})

//2 MIDDLEWARES=>MULTER AND VERIFYJWT
const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar File is required!!!")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400,"Error while uploading on avatar")    
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,{
        $set:{
            avatar:avatar.url
        }
    },{new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"User Avatar Image Updated Successfully!!!"))
})


const updateCoverImage=asyncHandler(async(req,res)=>{
    const coverImagelocalPath=req.file?.path
    if(!coverImagelocalPath){
        throw new ApiError(400,"Cover Image File is required")
    }
    const coverImage=await uploadOnCloudinary(coverImagelocalPath)
    if (!coverImage) {
        throw new ApiError(400,"Error while uploading the Cover Image")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,{
            $set:{
                coverImage:coverImage.url
            }
        }
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover Image Updated successfully"))
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params
    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }
    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[new mongoose.Types.ObjectId(req.user?._id),"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        //project se sbko nhi bss kuch kuchh selected cheezo ko dikhana hai..jisko show krna hota usko 1 krdo 
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1

            }
        }

    ])
    if (!channel?.length) {
        throw new ApiError(404,"channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully!!!")//channel array return ho rha to uska bss first element return krdo frontend me
    )
})


const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
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
                    }

                ]
            }
        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetched successfully!!!"
    ))
})

const deleteUserAccount=asyncHandler(async(req,res)=>{
    const userId=req.user._id;

    //Get user to delete files from cloudinary
    const user=await User.findById(userId);
    if(!user){
        throw new ApiError(404,"User Not Found!!!");
    }

    //DELETE user's videos and their files from cloudinary
    const userVideos=await Video.find({owner:userId});
    for(const video of userVideos){
        //delete video file and thumbnail from cloudinary

        const videoFilePublicId=video.videoFile.split("/").pop().split(".")[0];
        const thumbnailPublicId=video.thumbnail.split("/").pop().split(".")[0];

        await deleteFromCloudinary(videoFilePublicId,"video");
        await deleteFromCloudinary(thumbnailPublicId,"image");

        //delete likes and comments on the video
        await Like.deleteMany({video:video._id});
        await Comment.deleteMany({video:video._id});
    }
    await Video.deleteMany({owner:userId});

    //Delete user's tweets and their likes

    const userTweets=await Tweet.find({owner:userId});
    for(const tweet of userTweets){
        await Like.deleteMany({tweet:tweet._id});
    }
    await Tweet.deleteMany({owner:userId});

    //delete user's playlists
    await Playlist.deleteMany({owner:userId});

    //delete user's comments
    await Comment.deleteMany({owner:userId});

    //delete user's likes
    await Like.deleteMany({likedBy:userId});

    //delete user's subscriptions (both as channel and subscriber)
    await Subscription.deleteMany({
        $or:[
            {subscriber:userId},
            {channel:userId}
        ]
    });

    //delete user assets from Cloudinary
    if(user.avatar){
        const avatarPublicId=user.avatar.split("/").pop().split(".")[0];
        await deleteFromCloudinary(avatarPublicId);
    }
    if(user.coverImage){
        const coverImagePublicId=user.avatar.split("/").pop().split(".")[0];
        await deleteFromCloudinary(coverImagePublicId);
    }

    //delete user from db
    await User.findByIdAndDelete(userId);

    //clear cookies
    return res
    .status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(new ApiResponse(200,{},"User account and all associated Data deleted successfully!"))
})

const googleAuthCallback=asyncHandler(async(req,res)=>{
    const user=req.user;

    if(!user){
        throw new ApiError(500,"Google Authentication Failed!!!");
    }
    const { accessToken, refreshToken }=await generateAccessAndRefreshTokens(user._id);
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

    return res
    .status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .redirect(`${process.env.CLIENT_URL}/auth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});
export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    deleteUserAccount,
    googleAuthCallback
}

