import { registerAlumni } from "../controllers/alumini.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router =Router();

router.route("/registerAlumni").post(upload.single("avatar"),registerAlumni);

export default router;