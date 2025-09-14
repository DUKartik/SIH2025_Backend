// controllers/user.controller.js
import { User } from "../models/baseUser.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const searchUsers = asyncHandler(async (req, res) => {
  const { role, q } = req.query;

  if (!role) throw new ApiError(400, "role query param required (Student or Alumni)");
  if (role !== "Student" && role !== "Alumni") throw new ApiError(400, "role must be Student or Alumni");

  const regex = q && q.trim() ? new RegExp(q.trim(), "i") : null;

  const or = [];
  if (regex) {
    or.push(
      { first_name: regex },
      { middle_name: regex },
      { last_name: regex },
      { email: regex },
      { department: regex },
      { course: regex },
      { degree: regex },
      { college_roll: regex }
    );
    const maybeNum = Number(q);
    if (!Number.isNaN(maybeNum)) or.push({ batch_year: maybeNum });
  }

  const filter = { role };
  if (or.length) filter.$or = or;

  // exclude self from results when authenticated
if (req.user && req.user._id) {
  filter._id = { $ne: req.user._id };
}



  const users = await User.find(filter).select("-password_hash -refreshToken");
  return res.status(200).json(new ApiResponse(200, users, "Users fetched"));
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "id required");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");

  const user = await User.findById(id).select("-password_hash -refreshToken");
  if (!user) throw new ApiError(404, "User not found");
  return res.status(200).json(new ApiResponse(200, user, "User fetched"));
});

export { searchUsers, getUserById };
