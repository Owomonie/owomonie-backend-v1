import { Router } from "express";
import { handleGetAllBanks } from "../../controllers/banks/get-banks";

const getBanksRouter = Router();

getBanksRouter.get("/", handleGetAllBanks);

export default getBanksRouter;
