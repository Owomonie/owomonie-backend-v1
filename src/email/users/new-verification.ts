import sendMessage from "../transport";

const NewVerificationMessage = ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  sendMessage({
    email,
    html: `<p>${otp}</p>`,
    subject: "OTP Registration for Owomonie",
  });
};

export default NewVerificationMessage;
