import { Router } from "express";
import { handleSavePushToken } from "../../controllers/users/save-push-token";

const savePushToken = Router();

savePushToken.post("/", handleSavePushToken);

export default savePushToken;
