import { Request, Response } from "express";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";

import UserModel from "../../models/user";
import {
  ForgetVerificationMessage,
  ResetPasswordMessage,
} from "../../email/users/forget";

const isPasswordValid = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  return passwordRegex.test(password);
};

export const handleForgetPasswordVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  try {
    const foundUser = await UserModel.findOne({ email }).exec();

    if (!foundUser) {
      res.status(404).json({ success: false, message: "Email Not Found" });
      return;
    }

    const otp = otpGenerator.generate(5, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    foundUser.otp = otp;
    (foundUser.otpExpiry = new Date(Date.now() + 5 * 60000)),
      await foundUser.save();

    ForgetVerificationMessage({
      email,
      otp,
      userName: foundUser?.userName,
    });

    res.status(200).json({
      success: true,
      message: `OTP Sent to ${email}`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: (err as Error).message,
    });
  }
};

export const handleForgetVerifyOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { OTP, email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  if (!OTP) {
    res.status(400).json({ success: false, message: "OTP Required" });
    return;
  }

  try {
    const foundUser = await UserModel.findOne({ email }).exec();

    if (!foundUser) {
      res.status(404).json({ success: false, message: "Email Not Found" });
      return;
    }
    if (
      OTP !== foundUser.otp ||
      !foundUser.otpExpiry ||
      (foundUser.otpExpiry && new Date(foundUser.otpExpiry) < new Date())
    ) {
      res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
      return;
    }

    foundUser.resettingPassword = true;

    await foundUser.save();

    res.status(201).json({
      success: true,
      message: "Verification Successful",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const handleResetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { newPassword, email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  if (!newPassword) {
    res
      .status(400)
      .json({ success: false, message: "New Password is Required" });
    return;
  }

  if (!isPasswordValid(newPassword)) {
    res.status(400).json({ success: false, message: "Invalid Password" });
    return;
  }

  try {
    const foundUser = await UserModel.findOne({ email }).exec();

    if (!foundUser) {
      res.status(404).json({ success: false, message: "Email Not Found" });
      return;
    }

    if (foundUser.resettingPassword === false || undefined) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    foundUser.password = hashedPassword;
    foundUser.resettingPassword = false;
    foundUser.otp = undefined;
    foundUser.otpExpiry = undefined;

    await foundUser.save();

    ResetPasswordMessage({ email, userName: foundUser.userName });

    res.status(201).json({
      success: true,
      message: "Password Reset Successful",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};
