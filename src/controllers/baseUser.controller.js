import { User } from "../models/baseUser.model.js";
import { Alumni } from "../models/alumni.model.js";
import { Student } from "../models/student.model.js";
import { SuperAdmin } from "../models/admin_SuperAdmin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

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

    if(role !="Admin" && role !="Student" && role !="Alumni"){
        throw new ApiError(404,"Invalid role choosen");
    }

    let user = await User.findOne({email,role});
    let isSuperAdmin=0;
    if(!user && role==="Admin"){
        user= await SuperAdmin.findOne({email});
        isSuperAdmin=1;
    }
    if(!user){
        throw new ApiError(404,"user not found with this email");
    }
    if (!user.email_verified) {
        throw new ApiError(400, "Email is not verified. Please verify OTP first.");
    }
    if(user.role == "Alumni" && user.approved==false){
        throw new ApiError(403,"Thankyou for registrating! Your account is now awaiting review")
    }

    const isPasswordValid= await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"invalid Credentials");
    }

    const {refreshToken,accessToken} = await generateAccessAndRefreshToken(user._id,isSuperAdmin ? "SuperAdmin" : role);

    const loggedInUser = await User.findOne({email,role:isSuperAdmin ? "SuperAdmin" : role}).select("-password_hash -refreshToken");

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
                new ApiResponse(200,{accessToken,refreshToken},
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

const deleteAccount = asyncHandler(async (req,res) =>{
    const user = req.user;
    if(!user){
        throw new ApiError(500,"user not found");
    }

    await User.deleteOne({_id:user._id});
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"user Account deleted successfully")
    )
})

const getProfile = asyncHandler(async(req,res)=>{
    const user = req.user;
    if(!user){
        throw new ApiError(500,"user not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"profile fetched successfully")
    )
})

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "id required");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");

  const user = await User.findById(id).select("-password_hash -refreshToken");
  if (!user) throw new ApiError(404, "User not found");
  return res.status(200).json(new ApiResponse(200, user, "User fetched"));
});

const searchUsers = asyncHandler(async (req, res) => {
  const { 
    role, 
    q, 
    name, 
    batch_year, 
    degree, 
    department, 
    branch, 
    skills, 
    location 
  } = req.query;

  // Validate role
  let Model;
  if (role === "Alumni") {
    Model = Alumni;
  } else if (role === "Student") {
    Model = Student;
  } else {
    throw new ApiError(400, "Invalid role. Use 'Alumni' or 'Student'");
  }

  // Base filter
  const filter = {};

  // Generic search using q
  if (q && q.trim()) {
    const regex = new RegExp(q.trim(), "i");
    const or = [
      { first_name: regex },
      { middle_name: regex },
      { last_name: regex },
      { email: regex },
      { department: regex },
      { course: regex },
      { degree: regex },
      { college_roll: regex },
    ];
    const maybeNum = Number(q);
    if (!Number.isNaN(maybeNum)) or.push({ batch_year: maybeNum });
    filter.$or = or;
  }

  // Structured filters
  if (name) {
    filter.$or = [
      { first_name: new RegExp(name, "i") },
      { last_name: new RegExp(name, "i") },
    ];
  }

  if (batch_year) filter.batch_year = Number(batch_year);
  if (role === "Alumni") {
    if (degree) filter.degree = new RegExp(degree, "i");
    if (department) filter.department = new RegExp(department, "i");
    if (location) filter.location = new RegExp(location, "i");
  }
  if (role === "Student") {
    if (branch) filter.branch = new RegExp(branch, "i");
    if (skills) {
      filter.skills = { $in: skills.split(",").map((s) => s.trim()) };
    }
  }

  // Exclude self if logged in
  if (req.user && req.user._id) {
    filter._id = { $ne: req.user._id };
  }

  // Execute query
  const results = await Model.find(filter).select("-password_hash -refreshToken -email");

  return res
    .status(200)
    .json(new ApiResponse(200, results, `${role} search results`));
});

export {
    Login,
    logout,
    refreshAccessToken,
    changeCurrentPassword,
    deleteAccount,
    getProfile,
    searchUsers,
    getUserById
    };