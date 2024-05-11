import { Router } from "express";
import {
    deleteAllNotifications,
    getNotifications,
    deleteNotification,
} from "../controllers/notification.cotroller.js";
import { verifyAuthenticatedUser } from "../middlewares/auth.middleware.js";


const router = Router();


// PROTECTED ROUTES
router.get("/", verifyAuthenticatedUser, getNotifications);
router.delete("/", verifyAuthenticatedUser, deleteAllNotifications);
router.delete("/:notificationId", verifyAuthenticatedUser, deleteNotification);


export default router;