import { Router } from "express";
import { handleGetUserDetails } from "../../controllers/users/get-user-details";

const getUserDetailsRouter = Router();

getUserDetailsRouter.get("/", handleGetUserDetails);

export default getUserDetailsRouter;
