import {User} from "./baseUser.model.js"
import mongoose from "mongoose";
import ExperienceSchema from "./experience.model.js";
const AlumniSchema = new mongoose.Schema({
  batch_year: { 
    type: Number, 
    required: true 
  },
  degree: { 
    type: String, 
    required: true 
  },
  department: { 
    type: String, 
    required: true 
  },
  approved: { 
    type: Boolean, 
    default: false 
  },
  current_position: { type: String },
  current_company: { type: String },
  location: { type: String },

  experience: [ExperienceSchema],

  achievements: [{ type: String }],
  linkedin: { type: String },
  portfolio: { type: String },
  optins: {
    public_listing: { type: Boolean, default: false },
    mentorship_emails: { type: Boolean, default: false },
    newsletter: { type: Boolean, default: false },
    donation_emails: { type: Boolean, default: false },
    show_email_publicly: { type: Boolean, default: false },
  },
});

export const Alumni = User.discriminator("Alumni", AlumniSchema);
