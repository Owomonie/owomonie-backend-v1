import { Router } from "express";
import { handleSendNotification } from "../../controllers/notifications/send-notification";
import {
  handleGetAllDraftNotification,
  handleGetAllSentNotification,
} from "../../controllers/notifications/get-notifications";

const notificationByAdmin = Router();

notificationByAdmin.post("/send", handleSendNotification);
notificationByAdmin.get("/sent", handleGetAllSentNotification);
notificationByAdmin.get("/drafts", handleGetAllDraftNotification);

export default notificationByAdmin;
