import { Router } from "express";
import { handleUnauthenticatedSavePushToken } from "../../controllers/notifications/save-push-token";
import { handleSendMessage } from "../../controllers/notifications/send-message";

const unauthNotificationRouter = Router();

unauthNotificationRouter.post(
  "/save-push-token",
  handleUnauthenticatedSavePushToken
);

unauthNotificationRouter.post("/message", handleSendMessage);

export default unauthNotificationRouter;
