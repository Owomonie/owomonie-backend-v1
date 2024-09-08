import { Request, Response } from "express";

import UserModel from "../../models/user";
import { uploadAvatar } from "../../aws/avatar";

export const handleUpdateGender = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    const foundUser = await UserModel.findById(userId).exec();

    const { gender } = req.body;

    if (!gender) {
      res.status(400).json({ success: false, message: "Gender Not Selected" });
      return;
    }

    if (!foundUser) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    foundUser.gender = gender;

    await foundUser.save();

    res.status(200).json({ success: true, message: "Gender Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const handleUpdateAgeRange = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    const foundUser = await UserModel.findById(userId).exec();

    const { ageRange } = req.body;

    if (!ageRange) {
      res
        .status(400)
        .json({ success: false, message: "Age Range Not Selected" });
      return;
    }

    if (!foundUser) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    foundUser.ageRange = ageRange;

    await foundUser.save();

    res.status(200).json({ success: true, message: "Age Range Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const handleUpdateWorkType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    const foundUser = await UserModel.findById(userId).exec();

    const { workType } = req.body;

    if (!workType) {
      res
        .status(400)
        .json({ success: false, message: "Work Type Not Selected" });
      return;
    }

    if (!foundUser) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    foundUser.workType = workType;

    await foundUser.save();

    res.status(200).json({ success: true, message: "Work Type Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const handleUpdateIncomeRange = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    const foundUser = await UserModel.findById(userId).exec();

    const { incomeRange } = req.body;

    if (!incomeRange) {
      res
        .status(400)
        .json({ success: false, message: "Income Range Not Selected" });
      return;
    }

    if (!foundUser) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    foundUser.incomeRange = incomeRange;

    await foundUser.save();

    res.status(200).json({ success: true, message: "Income Range Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const handleUpdateAvatar = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    //@ts-ignore
    const file = req.file;
    const { avatarNum } = req.body;

    const foundUser = await UserModel.findById(userId).exec();

    if (!file && !avatarNum) {
      res.status(400).json({ success: false, message: "Image is required" });
      return;
    }

    if (!foundUser) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    if (file) {
      const response =
        foundUser.userName && (await uploadAvatar(file, foundUser?.userName));

      foundUser.avatar = response;
    } else {
      foundUser.avatar = avatarNum;
    }

    await foundUser.save();

    res.status(200).json({ success: true, message: `Avatar Updated` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
