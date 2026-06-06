import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";




const getAllVideos=asyncHandler(async(req,res)=>{
    const{page=1,limit=10,query,sortBy="createdAt",sortType="desc",userId}=req.query
    //to get all videos based on query,sort,pagination
    const pipeline=[]
    if(userId){
        pipeline.push({
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        })
    }

    if(query){
        pipeline.push({
            $match:{
                $or:[
                    {
                        title:{$regex:query,$options:"i"}
                    },
                    {
                        description:{$regex:query,$options:"i"}
                    }
                ]
            }
        })
    }

    pipeline.push({
        $sort:{
            [sortBy]:sortType==="desc"?-1:1
        }
    })
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
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
        }
    )

    const options={page:parseInt(page),limit:parseInt(limit)}
    const videos=await Video.aggregatePaginate(Video.aggregate(pipeline),options)

    return res
    .status(200)
    .json(new ApiResponse(200,videos,"Videos fetched successfully!!!"))
})

const publishVideo=asyncHandler(async(req,res)=>{
    const {title,description}=req.body
    //to get a video and upload it on cloudinary,create video
    if(!title||!description){
        throw new ApiError(400,"Title and description are required!!!")
    }
    const VideoFileLocalPath=req.files?.videoFile?.[0]?.path
    if(!VideoFileLocalPath){
        throw new ApiError(400,"Video file is required!!!")
    }
    const ThumbnailLocalPath=req.files?.thumbnail?.[0]?.path
    if(!ThumbnailLocalPath){
        throw new ApiError(400,"Thumbnail file is required!!!")
    }
    const videoFile=await uploadOnCloudinary(VideoFileLocalPath)
    const thumbnail=await uploadOnCloudinary(ThumbnailLocalPath)
    const video= await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title,
        description,
        duration:videoFile.duration,
        owner:req.user?._id
    })
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video Published Successfully!!!"))

})

const getVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    //to get an video by id
    const video= await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
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
    ])

    if (!video?.length) throw new ApiError(404, "Video not found!!!"); 
    return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully!!!"))
})

const updateVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    //to update the video details like title,description,thumbnails
    const {title,description}=req.body
    const thumbnailLocalPath=req.file?.path

    if(!title || !description){
        throw new ApiError(400,"Title and description are required!!!")
    }

    let thumbnail;
    if(thumbnailLocalPath){
        thumbnail=await uploadOnCloudinary(thumbnailLocalPath)
        if(!thumbnail) throw new ApiError(500,"Thumbnail Upload Failed!")
    }

    const video=await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                ...(thumbnail && { thumbnail: thumbnail.url     })
            }
        },
        {
            new:true
        }
    )
    if(!video) throw new ApiError(404,"Video not Found")
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video updated successfully!!!"))
})

const deleteVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    if(!videoId){
        throw new ApiError(400,"Video Id not found!")
    }
    //to delete video
    const video=await Video.findByIdAndDelete(videoId)
    if(!video){
        throw new ApiError(404,"Video not found!!!")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Video deleted successfully!!!"))
})

const togglePublishStatus=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const video= await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found!!!")
    }
    video.isPublished=!video.isPublished
    await video.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(new ApiResponse(200,{ isPublished: video.isPublished },"Publish status toggled!"))
})

export {
    getAllVideos,
    publishVideo,
    updateVideo,
    getVideoById,
    deleteVideo,
    togglePublishStatus

}