import { Router } from "express";
import { handleSavePushToken } from "../../controllers/notifications/save-push-token";

const notificationRouter = Router();

notificationRouter.patch("/save-push-token", handleSavePushToken);

export default notificationRouter;
