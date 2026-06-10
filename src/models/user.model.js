import mongoose,{Schema} from "mongoose";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
//Pre hook
const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true
        },
        fullName:{
            type:String,
            required:true,
            lowercase:true,
            trim:true,
            index:true
        },
        googleId:{
            type:String,
            unique:true,
            sparse:true
        },
        avatar:{
            type:String, //cloudinary url
            required:true
        },
        coverImage:{
            type:String, //cloudinary url
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:function(){
                return !this.googleId; //Required Only If GoogleId not present
            }
        },
        refreshToken:{
            type:String
        }
    },{
        timestamps:true
    })

userSchema.pre(         //pre is a hook of mongoose which does operation before storing in db
    "save",async function(next){        //in pre we give the property where we have to implement(here,save) and after which we have to implement a callback...but we know ()=>{} do not have the this referencing so we will write normal function(){} and most importantly this is a time taking function so use async with it
        if(!this.isModified("password")){        //only do the operation only when the password is modified     //bcrot is a method of bcrypt package which hashes the password and 10 means...go to documentation :-)
            return ;
        } 
        this.password=await bcrypt.hash(this.password,10);      //we have used next here as this is a middleware(pre)

    })
//for checking of password whether correct or not
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)     //compare returns true or false
}


userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
           _id:this._id,
           email:this.email,
           username:this.username,
           fullName:this.fullName
        },process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
           _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema)



//jwt=> bearer tokens....jo user token bear krega usko data milega