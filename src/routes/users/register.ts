import { Router } from "express";
import { handleRegisterNewUser } from "../../controllers/users/register";
const registerRouter = Router();

registerRouter.patch("/", handleRegisterNewUser);

export default registerRouter;
