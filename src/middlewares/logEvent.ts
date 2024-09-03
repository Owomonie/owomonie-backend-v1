import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";

// Define the logEvents function
export const logEvents = async (
  message: string,
  logName: string
): Promise<void> => {
  const dateTime = `${format(new Date(), "yyyyMMdd\tHH:mm:ss")}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
  console.log(logItem);

  try {
    const logsDir = path.join(__dirname, "..", "logs");

    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      await fs.promises.mkdir(logsDir);
    }

    // Append the log item to the log file
    await fs.promises.appendFile(path.join(logsDir, logName), logItem);
  } catch (error) {
    console.error("Error writing to log file:", error);
  }
};

// Define the logger middleware function
const logger = (req: any, res: any, next: () => void): void => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, "reqLog.txt");
  console.log(`${req.method} ${req.path}`);
  next();
};

export default logger;
