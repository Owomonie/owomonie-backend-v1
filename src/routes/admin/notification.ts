import { Router } from "express";
import { handleSendNotification } from "../../controllers/notifications/send-notification";

const notificationByAdmin = Router();

notificationByAdmin.post("/", handleSendNotification);

export default notificationByAdmin;
