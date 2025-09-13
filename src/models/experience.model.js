import mongoose from "mongoose";

const ExperienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },       // Job/Internship title
    company: { type: String, required: true },     // Organization
    location: { type: String },
    start_date: { type: Date, required: true },
    end_date: { type: Date },                      // null if ongoing
    description: { type: String },
    technologies: [{ type: String }],              // e.g., ["React", "Node.js"]
  },
  { _id: false }
);

export default ExperienceSchema;