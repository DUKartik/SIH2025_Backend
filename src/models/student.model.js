import {User} from "./baseUser.model.js"
import mongoose from "mongoose";

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
});

export const Student = User.discriminator("Student", StudentSchema);