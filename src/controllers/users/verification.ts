import { Request, Response } from "express";
import otpGenerator from "otp-generator";

import { v4 as uuidv4 } from "uuid";
import UserModel from "../../models/user";
import OtpModel from "../../models/otp";
import NewVerificationMessage from "../../email/users/new-verification";

// Handle new user verification and OTP generation
export const handleNewUserVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: "Invalid email format" });
    return;
  }

  try {
    const foundUser = await UserModel.findOne({ email }).exec();

    if (foundUser && foundUser.status !== 0) {
      res.status(409).json({ success: false, message: "Email Already Exists" });
      return;
    }

    const otp = otpGenerator.generate(5, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const sessionId = uuidv4(); // Generate a unique session ID

    const otpData = new OtpModel({
      email,
      otp,
      otpExpiry: new Date(Date.now() + 5 * 60000), // OTP expiry time
      sessionId,
    });

    await otpData.save();

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: true,
    });

    NewVerificationMessage({
      email,
      otp,
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

// Handle OTP validation and user registration
export const handleOTPRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { OTP, email } = req.body;

  if (!req.cookies) {
    res.status(400).json({ success: false, message: "No cookie Availiable" });
  }

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  if (!OTP) {
    res.status(400).json({ success: false, message: "OTP Required" });
    return;
  }

  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    res.status(400).json({ success: false, message: "Missing session ID" });
    return;
  }

  try {
    const otpRecord = await OtpModel.findOne({ sessionId }).exec();

    if (!otpRecord) {
      res.status(400).json({ success: false, message: "Invalid session ID" });
      return;
    }

    if (OTP !== otpRecord.otp || new Date(otpRecord.otpExpiry) < new Date()) {
      res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
      return;
    }

    await UserModel.create({ email });

    await OtpModel.deleteOne({ sessionId });

    res.status(201).json({
      success: true,
      message: "Verification Successful",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};
