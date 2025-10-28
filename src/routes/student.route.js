import { Router } from "express";
import { registerStudent,
         updateStudentProfile,
         getStudentExperience,
         updateStudentExperience,
         deleteStudentExperience,
         addStudentExperience
        } from "../controllers/student.controller.js";
import {verifyJWT,authorizeRoles} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/registerStudent").post(upload.single("avatar"),registerStudent);
router.route("/updateProfile").patch(verifyJWT,authorizeRoles("Student","Admin"),updateStudentProfile);

router.route("/addExperience").post(verifyJWT,authorizeRoles("Student"),addStudentExperience);
router.route("/getExperience").get(verifyJWT,authorizeRoles("Student"),getStudentExperience);
router.route("/updateExperience/:expId").patch(verifyJWT,authorizeRoles("Student"),updateStudentExperience);
router.route("/deleteExperience/:expId").delete(verifyJWT,authorizeRoles("Student"),deleteStudentExperience);
export default router;