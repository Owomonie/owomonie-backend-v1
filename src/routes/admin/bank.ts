import { Router } from "express";
import { handleCreateNewBank } from "../../controllers/banks/create-bank";

const bankRouter = Router();

bankRouter.get("/", handleCreateNewBank);

export default bankRouter;
