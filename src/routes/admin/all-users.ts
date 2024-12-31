import { Router } from "express";
import { handleGetAllUsers } from "../../controllers/users/get-all-users";

const users = Router();

users.get("/", handleGetAllUsers);

export default users;
