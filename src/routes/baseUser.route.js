import { Router } from "express";
import { Login,
        logout,
        refreshAccessToken,
        changeCurrentPassword,} from "../controllers/baseUser.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { searchUsers, getUserById } from "../controllers/searchUser.controller.js";
const router =Router();

router.route("/login").post(Login);

router.route("/logout").post(verifyJWT,logout);
router.route("/refreshAccessToken").post(refreshAccessToken);
router.route("/ChangeCurrentPassword").patch(verifyJWT,changeCurrentPassword);

router.get("/search", verifyJWT, searchUsers);
router.get("/profile/:id", verifyJWT, getUserById);

export default router;

