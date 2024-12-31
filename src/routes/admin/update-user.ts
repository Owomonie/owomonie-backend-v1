import { Router } from "express";
import { handleUserStatusUpdate } from "../../controllers/users/update-user-status";

const userUpdateAdmin = Router();

userUpdateAdmin.patch("/status/:userId", handleUserStatusUpdate);

export default userUpdateAdmin;
