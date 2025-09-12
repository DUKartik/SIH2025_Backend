import { User } from "../models/baseUser.model.js";
import { Event } from "../models/event.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Aggregate } from "mongoose";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken=async(_id,role)=>
{
    try {
        const user=await User.findOne({_id,role});
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};

    } catch (error) {
        throw new ApiError(508,"Error while generating Access and refresh token");
    }
}

const Login = asyncHandler(async (req,res)=>{
    const {email,password,role} = req.body;

    if(!email || !password || !role){
        throw new ApiError(401,"All fields are complusory");
    }

    if(role !="Admin" && role !="SuperAdmin" && role !="Student" && role !="Alumni"){
        throw new ApiError(404,"Invalid role choosen");
    }

    const user = await User.findOne({email,role});
    if(!user){
        throw new ApiError(404,"user not found with this email");
    }

    if(user.role == "Alumni" && user.approved==false){
        throw new ApiError(403,"Thankyou for registrating! Your account is now awaiting review")
    }

    const isPasswordValid= await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"invalid Credentials");
    }

    const {refreshToken,accessToken} = await generateAccessAndRefreshToken(user._id,role);

    const loggedInUser = await User.findOne({email,role}).select("-password_hash -refreshToken");

    const option={
        httpOnly:true,
        secure:false, // set it to true after creating frontend
        // sameSite: "none"
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(200,loggedInUser,"Loggedin Successfully")
    )
})

const logout = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:null
            }
        },
        {
            new:true
        }
    )
    const option={
        httpOnly:true,
        secure:false  //after creating frontend set it to true
    }

    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200,{},"user logged Out"))
})

const refreshAccessToken =asyncHandler(async(req,res)=>{
    const IncomingRefreshToken =req.cookies.refreshToken;

    if(!IncomingRefreshToken){
        throw new ApiError(401,"unauthorized request");
    }
    try {
            const decodedToken=jwt.verify(IncomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
            const user=await User.findById(decodedToken?._id);
        
            if(!user){
                throw new ApiError(401,"Invalid refreshToken")
            }
            
            if(IncomingRefreshToken !== user?.refreshToken){
                throw new ApiError(401,"refresh Token is expired or used");
            }
            
            const {accessToken,newRefreshToken} =await generateAccessAndRefreshToken(user._id,user.role)
            const option ={
                httpOnly:true,
                secure:false
            }
            return res
            .status(200)
            .cookie("accessToken",accessToken,option)
            .cookie("refreshToken",newRefreshToken,option)
            .json(
                new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401,error.message);
    }

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    let {oldPassword,newPassword,confirmPassword} = req.body;
    oldPassword=oldPassword?.trim();
    newPassword=newPassword?.trim();
    confirmPassword=confirmPassword?.trim();

    if(!(confirmPassword === newPassword)){
        throw new ApiError(400,"confirmPassword and newPassword should match");
    }

    const user=await User.findById(req.user?._id);

    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) {
        throw new ApiError(400,"Invalid Password");
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password has been changed")
    )

})

const getAllEvents = asyncHandler(async(req,res)=>{
    const { status, mode, tags, sortBy, order } = req.query;

    let filter = {};

    if (status) filter.status = status; 
    if (mode) filter.mode = mode;
    if (tags) filter.tags = { $in: tags.split(",") }; 

    let sort = {};
    if (sortBy) {
        sort[sortBy] = order === "asc" ? 1 : -1;
    } else {
        sort = { createdAt: -1 };
    }

    const events = await Event.find(filter).sort(sort);

    return res
    .status(200)
    .json(
        new ApiResponse(200,{events,count:events.length},"all event fetched successfully")
    );
})

const updateEventDetails = asyncHandler(async(req,res)=>{
    const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    if(!updatedEvent){
        throw new ApiError(400,"Event not fond");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"event details updated")
    )
})

const deleteEvent = asyncHandler(async(req,res)=>{
    const {event_id} = req.body;
    if(!event_id){
        throw new ApiError(400,"event doesn't exist");
    }
    await Event.deleteOne({_id:event_id});
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"deleted the event Successfully")
    )
})

export {
    Login,
    logout,
    refreshAccessToken,
    changeCurrentPassword,
    getAllEvents,
    updateEventDetails,
    deleteEvent
    };