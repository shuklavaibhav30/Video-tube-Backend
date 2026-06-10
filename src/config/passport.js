import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model";

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"/api/v1/users/auth/google/callback",
},
async(accessToken,refreshToken,profile,done)=>{
    try{
        let user= await User.findOne({googleId:profile.id})

        if(!user){
            //Check if user with same email already exists
            user=await User.findOne({email:profile.emails[0].value});
            if (user){
                //Link Google Account to existing User
                user.googleId=profile.id;
                await user.save({validateBeforeSave:false});

            }else{
                //create new user
                user=await User.create({
                    username:profile.emails[0].value.split("@")[0]+Math.floor(Math.random()*1000),
                    email:profile.emails[0].value,
                    fullName:profile.displayName,
                    avatar:profile.photos[0].value,
                    googleId:profile.id,
                });
            }
        }
        return done(null,user);
    }catch(err){
        return done(err,null);
    }
}
));

passport.serializeUser(async (id,done)=>{
    try{
        const user=await User.findById(id);
        done(null,user);
    }catch(err){
        done(err,null);
    }
});

export default passport;