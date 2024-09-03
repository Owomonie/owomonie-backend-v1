import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface SendMessageOptions {
  email: string;
  html: string;
  subject: string;
}

const user = process.env.GMAIL!;
const pass = process.env.GMAIL_PASSWORD!;

// Create a transporter using nodemailer
const transporter: Transporter = nodemailer.createTransport({
  service: "GMAIL",
  auth: {
    user,
    pass,
  },
});

function sendMessage({ email, html, subject }: SendMessageOptions): void {
  const mailOptions: nodemailer.SendMailOptions = {
    from: "Owomonie",
    to: email,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      //   console.log("Email sent:", info.response);
    }
  });
}

export default sendMessage;
