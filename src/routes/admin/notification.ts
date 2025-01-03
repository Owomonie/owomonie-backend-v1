import { Router } from "express";
import {
  handleDraftToSendNotification,
  handleSendNotification,
} from "../../controllers/notifications/send-notification";
import {
  handleGetAllDraftNotification,
  handleGetAllSentNotification,
} from "../../controllers/notifications/get-notifications";

const notificationByAdmin = Router();

notificationByAdmin.post("/send", handleSendNotification);
notificationByAdmin.patch(
  "/draft-to-send/:notificationId",
  handleDraftToSendNotification
);
notificationByAdmin.get("/sent", handleGetAllSentNotification);
notificationByAdmin.get("/drafts", handleGetAllDraftNotification);

export default notificationByAdmin;
