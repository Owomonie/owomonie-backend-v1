import { Router } from "express";
import {
  handleForgetPasswordVerification,
  handleForgetVerifyOTP,
  handleResetPassword,
} from "../../controllers/users/forget";

const forgetRouter = Router();

forgetRouter.post("/otp", handleForgetPasswordVerification);
forgetRouter.post("/verify-otp", handleForgetVerifyOTP);
forgetRouter.patch("/reset", handleResetPassword);

export default forgetRouter;
