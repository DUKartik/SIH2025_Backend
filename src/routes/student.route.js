import { Router } from "express";
import { registerStudent,
         updateStudentProfile
        } from "../controllers/student.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/registerStudent").post(upload.single("avatar"),registerStudent);
router.route("/updateProfile").patch(verifyJWT,updateStudentProfile);

export default router;