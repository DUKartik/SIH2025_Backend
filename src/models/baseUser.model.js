import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


const mongoose = require("mongoose");

const options = { discriminatorKey: "role", timestamps: true };

const BaseUserSchema = new mongoose.Schema(
    {
        first_name: { 
          type: String, 
          required: true 
        },
        middle_name: { 
          type: String
        },
        last_name: { 
          type: String, 
          required: true 
        },
        avatar: {
          type: String,
          required:true
        },
        email: { 
          type: String,
          required: true, 
          unique: true 
        },
        password_hash: { 
          type: String, 
          required: true 
        },
        email_verified: { 
          type: Boolean, 
          default: false 
        },
        refreshToken:{
            type:String,
        }
  },
  options
);


userSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
      {
            _id:this._id,
            email:this.email,
            role:this.role
        },

        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
          }
        )
}
      
      
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
      {
        _id:this._id,
        email:this.email,
        role:this.role
      },

      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
    }
  )
}
    
    
export const User = mongoose.model("User", BaseUserSchema);