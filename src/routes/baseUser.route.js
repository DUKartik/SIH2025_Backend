import { Router } from "express";
import { Login,
        logout,
        refreshAccessToken,
        changeCurrentPassword,} from "../controllers/baseUser.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =Router();

router.route("/login").post(Login);

router.route("/logout").post(verifyJWT,logout);
router.route("/refreshAccessToken").get(verifyJWT,refreshAccessToken);
router.route("/ChangeCurrentPassword").patch(verifyJWT,changeCurrentPassword);
export default router;

