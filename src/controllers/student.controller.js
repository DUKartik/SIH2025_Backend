import { Student } from "../models/student.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { college_Domain } from "../../constants.js";

const registerStudent = asyncHandler(async(req,res)=>{
    const {college_roll,batch_year,course,branch,first_name,middle_name,last_name,email,password_hash} = req.body || {};
    
    const requiredFields = { college_roll, batch_year, course, branch, first_name,last_name, email, password_hash };
    
    if (Object.values(requiredFields).some(value => !value)) {
        throw new ApiError(400, "kindly fill the mandatory field");
    }
    
    const emailDomain = email.include("@") ? email.split("@")[1] : null;

    if(emailDomain==null || emailDomain!=college_Domain){
        throw new ApiError(404,"invalid Email, kindly Enter your college mail");
    }

    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file missing");
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"Something went wrong while uploading avatar on cloudinary");
    }

    const student = await Student.create(
        {
            first_name,
            middle_name,
            last_name,
            avatar:avatar?.url,
            college_roll,
            batch_year,
            course,
            branch,
            email,
            password_hash
        }
    )
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,student,"Student Registered Successfully")
    )
})

export{
    registerStudent
}