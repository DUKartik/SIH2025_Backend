import { Router } from "express";
import { VerifyAlumni,
        getPendingApprovalAlumni, } from "../controllers/admin.controller.js";
import { createEvent } from "../controllers/event.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT,authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/verify-Alumni").post(verifyJWT,authorizeRoles("Admin"),VerifyAlumni);
router.route("/pending-approvalAlumni").get(verifyJWT,authorizeRoles("Admin"),getPendingApprovalAlumni);
router.route("/createEvent").post(verifyJWT,authorizeRoles("Admin"),upload.single("banner"),createEvent);

export default router;