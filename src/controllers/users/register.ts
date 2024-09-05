import { Request, Response } from "express";
import bcrypt from "bcrypt";

import UserModel from "../../models/user";
import RegistrationSuccessfulMessage from "../../email/users/registered";

const isPasswordValid = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  return passwordRegex.test(password);
};

export const handleRegisterNewUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, userName, firstName, lastName } = req.body;

  if (!email || !password || !userName || !firstName || !lastName) {
    res
      .status(400)
      .json({ success: false, message: "Missing User Credentials" });
    return;
  }

  const foundUser = await UserModel.findOne({
    email,
  }).exec();

  if (!foundUser) {
    res.status(401).json({ success: false, message: "Email Not Verified" });
    return;
  }

  if (!isPasswordValid(password)) {
    res.status(400).json({ success: false, message: "Invalid Password" });
    return;
  }

  const minUsernameLength = 4;

  if (userName.length < minUsernameLength) {
    res.status(400).json({
      success: false,
      message: `Username Too short`,
    });
    return;
  }

  try {
    if (foundUser.status === 1 && foundUser.email === email) {
      res
        .status(409)
        .json({ success: false, message: "Email Already Registered" });
      return;
    }

    if (foundUser.userName === userName) {
      res
        .status(401)
        .json({ success: false, message: "Username Already Taken" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    foundUser.userName = userName;
    foundUser.lastName = lastName;
    foundUser.firstName = firstName;
    foundUser.password = hashedPassword;
    foundUser.status = 1;

    await foundUser.save();

    RegistrationSuccessfulMessage({
      email,
      userName,
    });

    res.status(200).json({
      success: true,
      message: "Registration Successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
