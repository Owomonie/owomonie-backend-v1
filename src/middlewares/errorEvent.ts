import { Request, Response, NextFunction } from "express";
import { logEvents } from "./logEvent";

// Define the errorHandler middleware function
const errorEvent = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error details to the error log file
  logEvents(`${err.name}: ${err.message}`, "errLog.txt");

  // Log the error stack to the console
  console.error(err.stack);

  // Send a response with status 500 and the error message
  res.status(500).send(err.message);
};

export default errorEvent;
