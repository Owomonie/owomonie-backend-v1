import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";

// Multer error handling middleware
const multerErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          message: "File is too large",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          message: "File limit reached",
        });
      case "LIMIT_FIELD_KEY":
        return res.status(400).json({
          message: "Wrong file name",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          message: "File must be an image / Enter the right key",
        });
      default:
        return res.status(400).json({
          message: "Multer error",
        });
    }
  }

  next(error);
};

export default multerErrorHandler;
