import { Router } from "express";
import { Login} from "../controllers/baseUser.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =Router();

router.route("/login").post(Login);

export default router;

