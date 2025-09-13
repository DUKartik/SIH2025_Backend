import { Router } from "express";
import { Login,
        logout,
        refreshAccessToken,
        changeCurrentPassword,
        changeCurrentPassword,
        deleteAccount,
        getProfile
        } from "../controllers/baseUser.controller.js";
import {
        getAllEvents,
        updateEventDetails,
        deleteEvent
} from "../controllers/event.controller.js"
import { verifyJWT,authorizeRoles } from "../middlewares/auth.middleware.js";

const router =Router();

router.route("/login").post(Login);

router.route("/logout").post(verifyJWT,logout);
router.route("/refreshAccessToken").get(refreshAccessToken);
router.route("/ChangeCurrentPassword").patch(verifyJWT,changeCurrentPassword);
router.route("/deleteAccount").delete(verifyJWT,deleteAccount);
router.route("/getProfile").get(verifyJWT,getProfile);

router.route("/getAllEvents").get(verifyJWT,getAllEvents);
router.route("/updateEvent/:eventId").patch(verifyJWT,authorizeRoles("Admin"),updateEventDetails);
router.route("/deleteEvent/:eventId").delete(verifyJWT,authorizeRoles("Admin"),deleteEvent);
export default router;

