import { registerAlumni,
         updateAlumniProfile,
         getAlumniExperience,
         updateAlumniExperience,
         deleteAlumniExperience,
         addAlumniExperience
        } from "../controllers/alumini.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router =Router();

router.route("/registerAlumni").post(upload.single("avatar"),registerAlumni);
router.route("/updateprofile").get(verifyJWT,updateAlumniProfile);

router.route("/addExperience").post(verifyJWT,authorizeRoles("Alumni"),addAlumniExperience);
router.route("/addExperience").post(verifyJWT,authorizeRoles("Alumni"),getAlumniExperience);
router.route("/addExperience").post(verifyJWT,authorizeRoles("Alumni"),updateAlumniExperience);
router.route("/addExperience").post(verifyJWT,authorizeRoles("Alumni"),deleteAlumniExperience);

export default router;