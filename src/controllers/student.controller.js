import { Student } from "../models/student.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { college_Domain } from "../constants.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/baseUser.model.js";
import { default_avatar_url } from "../constants.js";
import { Otp } from "../models/otp.model.js";
import { addExperience,
    getExperiences,
    updateExperience,
    deleteExperience} from "../utils/experience.js"
import { extractAndSaveFaceEmbedding } from "../utils/faceRecognition.js";

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

    const otp = await Otp.findOne({email});
    if(!otp){
      throw new ApiError(400,"email verified expired ,kindly verify it again");
    }
    let isEmailVerified=false;
    if(otp.isVerified ===true){
        isEmailVerified=true;
    }else{
      throw new ApiError(400,"Email not verified");
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
            password_hash,
            email_verified: isEmailVerified,
        }
    )

    // Extract and save face embedding (non-blocking)
    if (avatar?.url) {
        extractAndSaveFaceEmbedding(student, avatar.url).catch(err => {
            console.error('Face embedding extraction failed:', err.message);
        });
    }

    const studentObj = student.toObject();
    delete studentObj.password_hash;
    delete studentObj.refreshToken;
    return res
    .status(200)
    .json(
        new ApiResponse(200,studentObj,"Student Registered Successfully")
    )
})

const updateStudentProfile = asyncHandler(async (req, res) => {
  const student = req.user;
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    student._id,
    { $set: req.body },
    { new: true }
  );

  const isChanged = Object.keys(req.body).some(
    (key) => String(student[key]) !== String(updatedStudent[key])
  );

  if (!isChanged) {
    throw new ApiError(400, "No fields were updated");
  }

  // If avatar was updated, regenerate face embedding (non-blocking)
  if (req.body.avatar && req.body.avatar !== student.avatar) {
    extractAndSaveFaceEmbedding(updatedStudent, req.body.avatar).catch(err => {
      console.error('Face embedding regeneration failed:', err.message);
    });
  }

  return res.status(200).json(
    new ApiResponse(200, updatedStudent, "Student profile updated")
  );
});

const addStudentExperience = async (req, res) => {
  const student = req.user;

  const expData = { ...req.body };
  if(expData.isCurrent === true){
    expData.end_date =null;
  }

  const updated = await addExperience(Student, student._id, expData);
  if (!updated) return res.status(404).json({ message: "student not found" });
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"student experience added successfully")
  );
};

const getStudentExperience = async (req, res) => {
  const student = req.user;
  const updated = await getExperiences(Student, student._id);
  if (!updated) return res.status(404).json({ message: "Student not found" });
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"Student experience fetched successfully")
  );
};
const updateStudentExperience = async (req, res) => {
  const student = req.user;
  const {expId} = req.params;
  const updated = await updateExperience(Student, student._id,expId,req.body);
  if (!updated) return res.status(404).json({ message: "Student not found" });
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"Student experience updated successfully")
  );
};
const deleteStudentExperience = async (req, res) => {
  const student = req.user;
  const {expId} = req.params;
  const updated = await deleteExperience(Student, student._id,expId);
  if (!updated) return res.status(404).json({ message: "Student not found" });
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"Student experience delete successfully")
  );
};

export{
    registerStudent,
    updateStudentProfile,
    updateStudentExperience,
    deleteStudentExperience,
    getStudentExperience,
    addStudentExperience
}