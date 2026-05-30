import mongoose,{isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist=asyncHandler(async(req,res)=>{
    const {name,description}=req.body

    //to create a playlist
    if(!name||!description){
        throw new ApiError(401,"name and descriptions are required!!!")
    }
    const playlist=await Playlist.create({
        name,
        description,
        videos:[],
        owner:req.user?._id
    })

    return res.status(200)
    .json(new ApiResponse(200,playlist,"user playlist created!!!"))
})

const getUserPlaylists=asyncHandler(async(req,res)=>{
    const {userId}=req.params
    //to get all the playlists of a user
    if(!userId){
        throw new ApiError(400,"USER ID NOT FOUND!!!")
    }

        const userPlaylist=await Playlist.aggregate([
            {
                $match:{
                    owner:new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"videos",
                    foreignField:"_id",
                    as:"videos"
                }
            },{
                $addFields:{
                   totalVideos:{
                    $size:"$videos"
                   }
                }
            },
            {
                $project:{
                    name:1,
                    description:1,
                    totalVideos:1,
                    createdAt:1
                }
            }
        ])
    return res
    .status(200)
    .json(new ApiResponse(200,userPlaylist,"user playlist fetched!!!"))
    
})

const getPlaylistById=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
    if(!playlistId){
        throw new ApiError(400,"playlist id not found!!!");
    }
    const playlist=await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
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
                            fullName:1,
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {$addFields:{
            owner:{
                $first:"$owner"
            }
        }}
            
        
    ])
    if(!playlist?.length) throw new ApiError(404,"Playlist Not found!!!");

    return res
    .status(200)
    .json(new ApiResponse(200,playlist[0],"Playlist fetched successfully!!!"))
})

const addVideoToPlaylist=asyncHandler(async(req,res)=>{
    const { playlistId,videoId }=req.params
    
    if(!videoId) throw new ApiError(400,"Video not found!!!");

    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{
                videos:videoId
            }
        },
        {
            new:true
        }
    )

    if(!playlist) throw new ApiError(400,"Playlist not found!!!");

    return res.status(200)
    .json(new ApiResponse(200,playlist,"Video added to Playlist!!!"));

})

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const { playlistId,videoId }=req.params
    //To remove video from a playlist

    if(!videoId) throw new ApiError(400,"Video not found!!!");

    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:new mongoose.Types.ObjectId(videoId)     //pull-> remove from array
            }
        },
        {
            new:true
        }
    )

    if(!playlist) throw new ApiError(400,"Playlist not found!!!");

    return res.status(200)
    .json(new ApiResponse(200,playlist,"Video removed from Playlist!!!"));
})

const deletePlaylist=asyncHandler(async(req,res)=>{
    const { playlistId }=req.params
    //to delete a playlist
    const playlist=await Playlist.findByIdAndDelete(playlistId);
    if(!playlist) throw new ApiError(400,"Playlist not found!!!");

    return res.status(200)
    .json(new ApiResponse(200,{},"Playlist deleted successfully !!!"));
})

const updatePlaylist=asyncHandler(async(req,res)=>{
    
    const {playlistId }=req.params
    const {name,description}=req.body
    //update playlist
    if(!name||!description) throw new ApiError(400,"Either name or the description is missing")
    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,{
            $set:{
                name,description
            }
        },
        {
            new:true
        }
    )
    if(!playlist) throw new ApiError(400,"Playlist not found!!!");

    return res.status(200)
    .json(new ApiResponse(200,playlist,"Playlist updated successfully !!!"));

})

export{
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}