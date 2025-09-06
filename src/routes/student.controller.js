import { Router } from "express";
import { registerStudent } from "../controllers/student.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/registerStudent").post(upload.single("avatar"),registerStudent);

export default router;