import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import cors from "cors";

import {
  deleteOTP,
  deleteUnregisteredUsers,
} from "./controllers/users/delete-users";
import {
  plaidRoute,
  // bank,
  // banks,
  userDetailsRoute,
  userForgetPassword,
  userLoginRoute,
  userRegisterRoute,
  userUpdate,
  userVerificationRoute,
} from "./routes";
import { errorEvent, logger, verifyAdmin, verifyAuth } from "./middlewares";
import { connectDB } from "./config";
import multerErrorHandler from "./middlewares/multerError";
import corsOptions from "./config/corsOption";
import users from "./routes/admin/all-users";
import userUpdateAdmin from "./routes/admin/update-user";
import notificationByAdmin from "./routes/admin/notification";
import logoutRouter from "./routes/users/logout";
import savePushToken from "./routes/users/save-push-token";

dotenv.config();

const app = express();
const port = process.env.PORT!;

app.use(express.json());

app.use(express.static("public"));

connectDB();

cron.schedule("0 0 * * *", deleteUnregisteredUsers);
cron.schedule("0 0 * * *", deleteOTP);

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(logger);

app.use("/new-user-verification", userVerificationRoute);
app.use("/register-user", userRegisterRoute);
app.use("/login", userLoginRoute);
app.use("/forget-password", userForgetPassword);
app.use("/save-push-token", savePushToken);

app.use(verifyAuth);
app.use("/get-user-details", userDetailsRoute);
app.use("/update", userUpdate);
// app.use("/banks", banks);
app.use("/logout", logoutRouter);
app.use("/plaid", plaidRoute);

app.use(verifyAdmin);
// app.use("/bank", bank);
app.use("/get-all-users", users);
app.use("/update-user", userUpdateAdmin);
app.use("/notification", notificationByAdmin);

app.use(multerErrorHandler);
app.use(errorEvent);

mongoose.set("strictQuery", false);

mongoose.connection.once("open", () => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
