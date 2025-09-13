import {User} from "./baseUser.model.js"
import mongoose from "mongoose";
import ExperienceSchema from "./experience.model.js";

const StudentSchema = new mongoose.Schema({
    college_roll: { 
        type: String, 
        required: true 
    },
    batch_year: { 
        type: Number, 
        required: true 
    },
    course: { 
        type: String, 
        required: true 
    },
    branch: { 
        type: String, 
        required: true 
    },
    skills: [{ type: String }],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String },
        technologies: [{ type: String }],
        link: { type: String },
      },
    ],
    experience: [ExperienceSchema],
});

export const Student = User.discriminator("Student", StudentSchema);