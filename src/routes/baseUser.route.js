import { Router } from "express";
import { Login,
        logout,
        refreshAccessToken,
        changeCurrentPassword,
        getAllEvents,
        updateEventDetails,
        deleteEvent} from "../controllers/baseUser.controller.js";
import { verifyJWT,authorizeRoles } from "../middlewares/auth.middleware.js";

const router =Router();

router.route("/login").post(Login);

router.route("/logout").post(verifyJWT,logout);
router.route("/refreshAccessToken").get(verifyJWT,refreshAccessToken);
router.route("/ChangeCurrentPassword").patch(verifyJWT,changeCurrentPassword);

router.route("/getAllEvents").get(verifyJWT,getAllEvents);
router.route("/updateEventDetails").patch(verifyJWT,authorizeRoles("Admin"),updateEventDetails);
router.route("/deleteEvent").delete(verifyJWT,authorizeRoles("Admin"),deleteEvent);
export default router;

