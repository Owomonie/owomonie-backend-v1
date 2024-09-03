import OtpModel from "../../models/otp";
import UserModel from "../../models/user";

export const deleteUnregisteredUsers = async (): Promise<void> => {
  try {
    const cutoffTime = new Date(Date.now() - 60 * 60 * 1000);

    const unregisteredUsersCount = await UserModel.countDocuments({
      status: 0,
      createdAt: { $lt: cutoffTime },
    });

    if (unregisteredUsersCount > 0) {
      // Delete unregistered users if any are found
      await UserModel.deleteMany({
        status: 0,
        createdAt: { $lt: cutoffTime },
      });
      console.log("Unregistered users deleted successfully.");
    } else {
      // console.log("No unregistered users found to delete.");
    }
  } catch (error) {
    // console.error("Error deleting inactive users:", error);
  }
};

export const deleteOTP = async (): Promise<void> => {
  try {
    // Define the cutoff time as 5 minutes ago
    const cutoffTime = new Date(Date.now() - 5 * 60 * 1000);

    await OtpModel.deleteMany({
      otpExpiry: { $lt: cutoffTime },
    });

    console.log("Expired OTPs deleted successfully.");
  } catch (error) {
    // console.error("Error deleting expired OTPs:", error);
  }
};
