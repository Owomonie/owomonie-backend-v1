import { Router } from "express";
import { handleLogin } from "../../controllers/users/login";

const loginRouter = Router();

loginRouter.post("/", handleLogin);

export default loginRouter;
