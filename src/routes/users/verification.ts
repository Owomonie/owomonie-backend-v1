import { Router } from "express";
import {
  handleNewUserVerification,
  handleOTPRequest,
} from "../../controllers/users/verification";

const verificationRouter = Router();

verificationRouter.post("/", handleNewUserVerification);
verificationRouter.post("/verify-otp", handleOTPRequest);

export default verificationRouter;
