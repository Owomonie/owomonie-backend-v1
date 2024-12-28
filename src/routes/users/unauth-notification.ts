import { Router } from "express";
import { handleUnauthenticatedSavePushToken } from "../../controllers/notifications/save-push-token";

const unauthNotificationRouter = Router();

unauthNotificationRouter.post(
  "/save-push-token",
  handleUnauthenticatedSavePushToken
);

export default unauthNotificationRouter;
