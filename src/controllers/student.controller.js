import { Student } from "../models/student.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { college_Domain } from "../constants.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/baseUser.model.js";
import { default_avatar_url } from "../constants.js";


const registerStudent = asyncHandler(async(req,res)=>{
    const {college_roll,batch_year,course,branch,first_name,middle_name,last_name,email,password_hash} = req.body || {};
    
    const requiredFields = { college_roll, batch_year, course, branch, first_name,last_name, email, password_hash };
    
    if (Object.values(requiredFields).some(value => !value)) {
        throw new ApiError(400, "kindly fill the mandatory field");
    }
    
    const emailDomain = email.includes("@") ? email.split("@")[1] : null;

    if(emailDomain==null || emailDomain!=college_Domain){
        throw new ApiError(404,"invalid Email, kindly Enter your college mail");
    }

    const checkUnique = await User.findOne({email});
    if(checkUnique){
        throw new ApiError(404,"User Already exist with this email");
    }
    
    const avatarLocalPath = req.file?.path;
    let avatar;
    if(avatarLocalPath){
        avatar =await uploadOnCloudinary(avatarLocalPath);
        if(!avatar?.url){
            throw new ApiError(400,"Something went wrong while uploading avatar on cloudinary");
        }
    }

    const student = await Student.create(
        {
            first_name,
            middle_name,
            last_name,
            avatar:avatar?.url || default_avatar_url,
            college_roll,
            batch_year,
            course,
            branch,
            email,
            password_hash
        }
    )

    const studentObj = student.toObject();
    delete studentObj.password_hash;
    delete studentObj.refreshToken;
    return res
    .status(200)
    .json(
        new ApiResponse(200,studentObj,"Student Registered Successfully")
    )
})

export{
    registerStudent
}