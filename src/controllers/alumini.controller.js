import { Alumni } from "../models/alumni.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerAlumni = asyncHandler(async(req,res)=>{
    const {degree,batch_year,department,first_name,middle_name,last_name,email,password_hash} = req.body || {};
    
    const requiredFields = { degree, batch_year, department, first_name,last_name, email, password_hash };
    
    if (Object.values(requiredFields).some(value => !value)) {
        throw new ApiError(400, "kindly fill the mandatory field");
    }

    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file missing");
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"Something went wrong while uploading avatar on cloudinary");
    }

    const alumni = await Alumni.create(
        {
            first_name,
            middle_name,
            last_name,
            avatar:avatar?.url,
            degree,
            batch_year,
            department,
            email,
            password_hash
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,alumni,"Alumni Registered Successfully")
    )
})

export{
    registerAlumni,
}