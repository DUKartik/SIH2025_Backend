import { Alumni } from "../models/alumni.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/baseUser.model.js";
import { default_avatar_url } from "../constants.js";
import { addExperience,getExperiences,deleteExperience,updateExperience } from "../utils/experience.js";
import { Otp } from "../models/otp.model.js";
import { extractAndSaveFaceEmbedding } from "../utils/faceRecognition.js";

const registerAlumni = asyncHandler(async(req,res)=>{                                             // is profile complete check in model of alumni and student
    const {first_name,middle_name,last_name,email,password_hash} = req.body || {};                     
                                                                                                  // also make admin only get alumni profiles which are complete.
    const requiredFields = {first_name,last_name, email, password_hash };
    
    if (Object.values(requiredFields).some(value => !value)) {
        throw new ApiError(400, "kindly fill the mandatory field");
    }       
    const checkUnique = await User.findOne({email});
    if(checkUnique){
        throw new ApiError(404,"User Already exist with this email");
    }
    const otp = await Otp.findOne({email:email});
    if(!otp){
      throw new ApiError(400,"email verification expired ,kindly verify it again");
    }
    let isEmailVerified=false;
    if(otp.isVerified ===true){
        isEmailVerified=true;
    }else{
      throw new ApiError(400,"Email not verified");
    }

    const degreeLocalPath = req.file?.path;
    let degree;
    if(degreeLocalPath){
        degree =await uploadOnCloudinary(degreeLocalPath);
        if(!degree?.url){
            throw new ApiError(400,"Something went wrong while uploading degree on cloudinary");
        }
    }
    else{
      throw new ApiError(400,"Please upload the degree to register.");
    }


    const alumni = await Alumni.create(
        {
            first_name,
            middle_name,
            last_name,
            degree:degree?.url,                   
            email,
            password_hash,
            email_verified: isEmailVerified,
          }
        )

    // Extract and save face embedding (non-blocking)                                           // transfer this to antoher profile completion funciton
    // if (avatar?.url) {
    //     extractAndSaveFaceEmbedding(alumni, avatar.url).catch(err => {
    //         console.error('Face embedding extraction failed:', err.message);
    //     });
    // }

    const alumniObj = alumni.toObject();
    delete alumniObj.password_hash;
    delete alumniObj.refreshToken;
    delete alumniObj.faceEmbedding;
    return res
    .status(200)
    .json(
        new ApiResponse(200,alumniObj,"Alumni Registered Successfully")
    )
})
const completeAlumniProfile = asyncHandler(async(req,res)=>{
const oldAlumni = req.user;

if(oldAlumni.isProfileComplete){
  throw new ApiError (400, "Profile already complete");
}

  const {department, batch_year, aboutMe} = {...req.body};
  const avatarLocalPath=req.file?.path;

  const required_fields ={department, batch_year, aboutMe};
  if(Object.values(required_fields).some(value => !value)){
    throw new ApiError(400,"Kindly fill the mandatory fields to complete profile");
  }

  let avatar;
  if(avatarLocalPath){
    avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar?.url){
      throw new ApiError(400, "Something went wrong and could not upload image on cloudinary");
    }
    }
  else{
    throw new ApiError(400, "Please upload the avatar to complete profile");
  }
    const updatedAlumni = await Alumni.findByIdAndUpdate(
    oldAlumni._id,
    { $set: {...req.body, isProfileComplete: true} },
    { new: true , select : "-password_hash -refreshToken -faceEmbedding" }
  );

  if (avatar?.url) {
        extractAndSaveFaceEmbedding(updatedAlumni, avatar.url).catch(err => {
            console.error('Face embedding extraction failed:', err.message);
        });
    }



  return res.status(200).json(new ApiResponse(200, updatedAlumni, "Alumni profile completed"));
//
})
const updateAlumniProfile = asyncHandler(async (req, res) => {
  const oldAlumni = req.user;
  if (!oldAlumni) {
    throw new ApiError(404, "Alumni not found");
  }

  const updatedAlumni = await Alumni.findByIdAndUpdate(
    oldAlumni._id,
    { $set: req.body },
    { new: true }
  );

  const isChanged = Object.keys(req.body).some(
    (key) => String(oldAlumni[key]) !== String(updatedAlumni[key])
  );

  if (!isChanged) {
    throw new ApiError(400, "No fields were updated");
  }

  // If avatar was updated, regenerate face embedding (non-blocking)
  if (req.body.avatar && req.body.avatar !== oldAlumni.avatar) {
    extractAndSaveFaceEmbedding(updatedAlumni, req.body.avatar).catch(err => {
      console.error('Face embedding regeneration failed:', err.message);
    });
  }

  return res.status(200).json(
    new ApiResponse(200, updatedAlumni, "Alumni profile updated")
  );
});

const addAlumniExperience = async (req, res) => {
  const alumni = req.user;

  const expData = { ...req.body };
  if(expData.isCurrent === true){
    expData.end_date =null;
  }
  const updated = await addExperience(Alumni, alumni._id, expData);
  if (!updated){
    throw new ApiError(400,"Alumni not Found");
  }
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"alumni experience added successfully")
  );
};

const getAlumniExperience = async (req, res) => {
  const alumni = req.user;
  const updated = await getExperiences(Alumni, alumni._id);
  if (!updated) return res.status(404).json({ message: "Alumni not found" });
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"alumni experience fetched successfully")
  );
};
const updateAlumniExperience = async (req, res) => {
  const alumni = req.user;
  const {expId} = req.params;
  const updated = await updateExperience(Alumni, alumni._id,expId,req.body);
  if (!updated) return res.status(404).json({ message: "Alumni not found" });
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"alumni experience updated successfully")
  );
};
const deleteAlumniExperience = async (req, res) => {
  const alumni = req.user;
  const {expId} = req.params;
  const updated = await deleteExperience(Alumni, alumni._id,expId);
  if (!updated) return res.status(404).json({ message: "Alumni not found" });
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"alumni experience delete successfully")
  );
};


export{
    registerAlumni,
    updateAlumniProfile,
    completeAlumniProfile,
    updateAlumniExperience,
    addAlumniExperience,
    deleteAlumniExperience,
    getAlumniExperience
}