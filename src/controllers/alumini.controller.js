import { Alumni } from "../models/alumni.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/baseUser.model.js";

const registerAlumni = asyncHandler(async(req,res)=>{
    const {degree,batch_year,department,first_name,middle_name,last_name,email,password_hash} = req.body || {};
    
    const requiredFields = { degree, batch_year, department, first_name,last_name, email, password_hash };
    
    if (Object.values(requiredFields).some(value => !value)) {
        throw new ApiError(400, "kindly fill the mandatory field");
    }       
    const checkUnique = await User.findOne({email});
    if(checkUnique){
        throw new ApiError(404,"User Already exist with this email");
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

    const alumniObj = alumni.toObject();
    delete alumniObj.password_hash;
    delete alumniObj.refreshToken;

    return res
    .status(200)
    .json(
        new ApiResponse(200,alumniObj,"Alumni Registered Successfully")
    )
})

export{
    registerAlumni,
}