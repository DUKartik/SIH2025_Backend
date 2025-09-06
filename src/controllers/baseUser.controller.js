import { User } from "../models/baseUser.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const isPasswordValid= await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"invalid Credentials");
    }

    const {refreshToken,accessToken} = await generateAccessAndRefreshToken(user._id,role);

    const loggedInUser = await User.findOne({email,role}).select("-password_hash -refreshToken");

    const option={
        httpOnly:true,
        secure:false // set it to true after creating frontend
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(200,loggedInUser,"Loggedin Successfully")
    )
})

export {Login};