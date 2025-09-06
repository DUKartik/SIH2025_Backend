import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());

app.use(express.json({limit:"16kb",}));
app.use(express.urlencoded({limit:"16kb"}));
app.use(express.static("public")); // whichh could be acess by anyone
app.use(cookieParser()); // use to store read cookie on user browser

//routes import
import adminRouter from "./routes/admin.controller.js"
import studentRouter from "./routes/student.controller.js"
import baseUserRouter from "./routes/baseUser.route.js"
import alumniRouter from "./routes/alumni.controller.js"
//routes decleration

app.use("/api/v1/baseUsers",baseUserRouter);
app.use("/api/v1/students",studentRouter);
app.use("/api/v1/admins",adminRouter);
app.use("/api/v1/alumni",alumniRouter);

export {app};