import sendMessage from "../transport";

export const ForgetVerificationMessage = ({
  email,
  otp,
  userName,
}: {
  email: string;
  otp: string;
  userName?: string;
}) => {
  sendMessage({
    email,
    html: `<p>Hello ${userName}, Your reset passwod OTP is ${otp}</p>`,
    subject: "OTP Forget Password from Owomonie",
  });
};

export const ResetPasswordMessage = ({
  email,
  userName,
}: {
  email: string;
  userName?: string;
}) => {
  sendMessage({
    email,
    html: `<p>Dear ${userName}, Your password has been reset</p>`,
    subject: "Password Reset Owomonie",
  });
};
