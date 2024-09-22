import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

interface File {
  originalname: string;
  buffer: Buffer;
}

export const uploadBankLogo = async (
  file: File,
  bankSortCode: string
): Promise<string> => {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
  });

  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME is not defined");
  }

  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `banks/${uuid()}-${bankSortCode}-${file.originalname}`,
    Body: file.buffer,
  };

  try {
    const command = new PutObjectCommand(param);
    await s3Client.send(command);

    const url = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${param.Key}`;
    return url;
  } catch (err) {
    console.error("Error uploading bank logo:", err);
    throw err;
  }
};

export const deleteBankLogo = async (logoKey: string): Promise<void> => {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
  });

  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME is not defined");
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: logoKey,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    console.log(`Successfully deleted logo: ${logoKey}`);
  } catch (err) {
    console.error("Error deleting bank logo:", err);
    throw err;
  }
};
