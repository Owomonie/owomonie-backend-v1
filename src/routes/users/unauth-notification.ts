import { Router } from "express";
import { handleUnauthenticatedSavePushToken } from "../../controllers/notifications/save-push-token";
import { handleSendMesaage } from "../../controllers/notifications/send-message";

const unauthNotificationRouter = Router();

unauthNotificationRouter.post(
  "/save-push-token",
  handleUnauthenticatedSavePushToken
);

unauthNotificationRouter.post("/message", handleSendMesaage);

export default unauthNotificationRouter;
