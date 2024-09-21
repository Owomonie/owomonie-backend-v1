import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import {
  deleteOTP,
  deleteUnregisteredUsers,
} from "./controllers/users/delete-users";
import {
  createBank,
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

dotenv.config();

const app = express();
const port = process.env.PORT!;

app.use(express.json());

app.use(express.static("public"));

// Connect to MongoDB
connectDB();

cron.schedule("0 0 * * *", deleteUnregisteredUsers);
cron.schedule("0 0 * * *", deleteOTP);

app.use(cookieParser());

app.use(logger);

app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/png" href="/assets/logo2.png" />
    <title>Owomonie API Call</title>
    <style>
      body {
        background-color: #1772ab;
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 50px;
        margin: 0;
      }
      h1 {
        font-size: 3em;
        margin-bottom: 20px;
      }
      p {
        font-size: 1.5em;
      }
    </style>
  </head>
  <body>
  <img src="/assets/logo.png" alt="Owomonie Logo" class="logo" />
    <h1>Welcome to Owomonie API calls</h1>
    <p>This is the end point collection point for owomonie</p>
  </body>
</html>
`);
});

app.use("/new-user-verification", userVerificationRoute);
app.use("/register-user", userRegisterRoute);
app.use("/login", userLoginRoute);
app.use("/forget-password", userForgetPassword);

app.use(verifyAuth);
app.use("/get-user-details", userDetailsRoute);
app.use("/update", userUpdate);

app.use(verifyAdmin);
app.use("/bank", createBank);

app.use(multerErrorHandler);
app.use(errorEvent);

mongoose.set("strictQuery", false);

mongoose.connection.once("open", () => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
