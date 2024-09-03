import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

interface File {
  originalname: string;
  buffer: Buffer;
}

export const uploadAvatar = async (
  file: File,
  username: string
): Promise<string> => {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
  });

  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME is not defined");
  }

  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `avatar/${uuid()}-${username}-${file.originalname}`,
    Body: file.buffer,
  };

  try {
    const command = new PutObjectCommand(param);
    await s3Client.send(command);

    const url = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${param.Key}`;
    return url;
  } catch (err) {
    console.error("Error uploading avatar:", err);
    throw err;
  }
};
