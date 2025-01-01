import sendMessage from "../transport";

const GeneralMessage = ({
  email,
  title,
  body,
  userName,
}: {
  email: string;
  userName?: string;
  title: string;
  body: string;
}) => {
  sendMessage({
    email,
    html: `<div>
          <p>${body}</p>
     </div>`,
    subject: title,
  });
};

export default GeneralMessage;
