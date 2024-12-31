import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET!;

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (token == null) {
    res.status(401).json({ success: false, message: "Token Required" });
    return;
  }

  try {
    // Fetch all users and their tokens
    const users = await UserModel.find();
    const userTokens = users.flatMap((user) => user.loginToken);

    // Check if the token exists in the userTokens array
    if (!userTokens.includes(token)) {
      res.status(403).json({
        success: false,
        message: "Token Not Associated with Any User",
      });
      return;
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        res.status(403).json({ success: false, message: "Invalid User Token" });
        return;
      }

      // Attach the user info to the request
      //@ts-ignore
      req.user = user;
      next();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export default authenticateToken;
