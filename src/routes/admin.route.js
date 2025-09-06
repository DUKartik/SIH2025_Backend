import { Router } from "express";
import { registerAdmin } from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register-Admin").post(upload.single("avatar"),registerAdmin);

export default router;