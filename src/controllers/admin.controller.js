import { Admin } from "../models/admin_SuperAdmin.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {Alumni} from "../models/alumni.model.js"

const VerifyAlumni = asyncHandler(async(req,res)=>{
    const {alumni_id} = req.body || {};
    if(!alumni_id){
        throw new ApiError(500,"alumni_id not recieved");
    }
    const alumni = await Alumni.findByIdAndUpdate(
        alumni_id,
        {
            $set:{approved:true},
        },
        {new:true}
    ).select("-password_hash -refreshToken");
    
    if(!alumni){
        throw new ApiError(500,"alumni not found with the server ggiven id");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,alumni,"Alumni Approved Successfully")
    )

})

const denyAlumni = asyncHandler(async(req,res)=>{
    const {alumni_id} = req.body || {};
     if(!alumni_id){
        throw new ApiError(500,"alumni_id not recieved");
    }
    await Alumni.deleteOne({_id:alumni_id});

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Alumni Disproved successfully")
    )
})

const getPendingApprovalAlumni = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;   
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;
    
    const PendingApproval = await Alumni.aggregate([
        {
            $match:{
                approved:false,
            }
        },
        {
            $facet: {
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    { $project: { password_hash: 0, refreshToken: 0 } }
                ],
                metadata: [
                    { $count: 'totalPending' }
                ]
            }
        },
        {
            $project:{
                data:'$data',
                totalPending: { $arrayElemAt: ['$metadata.totalPending', 0] }
            }
        }
    ]);
    return res
    .status(200)
    .json(
        new ApiResponse(200,PendingApproval,"list of all pending alumni fetched successfully")
    )
})

export{
    VerifyAlumni,
    getPendingApprovalAlumni,
    denyAlumni,
}