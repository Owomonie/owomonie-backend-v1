import { Request, Response } from "express";

import UserModel from "../../models/user";

export const handleGetAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await UserModel.find().exec();

    if (!users || users.length === 0) {
      res.status(404).json({ success: false, message: "No Users Availiable" });
      return;
    }

    const usersDetails = users
      .filter((user) => !user.isAdmin)
      .filter((user) => user.status !== 0)
      .map((user) => ({
        id: user.id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        avatar: user.avatar,
        status: user.status,
        lastLogin: user.lastLogin,
        registeredDate: user.createdAt,
      }));

    res.status(200).json({ success: true, users: usersDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
