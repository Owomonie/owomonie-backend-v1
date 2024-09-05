import sendMessage from "../transport";

const RegistrationSuccessfulMessage = ({
  email,
  userName,
}: {
  email: string;
  userName: string;
}) => {
  sendMessage({
    email,
    html: `<p>Hello ${userName}, Congratulations! Your registration with owomonie is successful</p>`,
    subject: "Owomonie Registration Successful",
  });
};

export default RegistrationSuccessfulMessage;
