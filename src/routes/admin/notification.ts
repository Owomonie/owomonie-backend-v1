import { Router } from "express";
import { handleSendNotification } from "../../controllers/notifications/send-notification";

const notification = Router();

notification.post("/", handleSendNotification);

export default notification;
