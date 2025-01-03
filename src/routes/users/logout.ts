import { Router } from "express";
import { handleLogout } from "../../controllers/users/logout";

const logoutRouter = Router();

logoutRouter.get("/", handleLogout);

export default logoutRouter;
