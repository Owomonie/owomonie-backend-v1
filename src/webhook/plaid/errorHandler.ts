import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Your error:");
  console.error(err);

  if (err.response?.data != null) {
    // Handle errors with response data
    res.status(500).send(err.response.data);
  } else {
    // General error handling
    res.status(500).send({
      error_code: "OTHER_ERROR",
      error_message: "I got some other message on the server.",
    });
  }
};
