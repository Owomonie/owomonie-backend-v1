import { Request, Router } from "express";
import multer, { FileFilterCallback, MulterError } from "multer";

import {
  handleUpdateAgeRange,
  handleUpdateAvatar,
  handleUpdateGender,
  handleUpdateIncomeRange,
  handleUpdateWorkType,
} from "../../controllers/users/update";

const updateRouter = Router();

// Multer storage configuration
const storage = multer.memoryStorage();

// Multer file filter function
const fileFilter: (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => void = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    //@ts-ignore
    cb(new MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10000000, // 10 MB
    files: 1,
  },
});

updateRouter.patch("/gender", handleUpdateGender);
updateRouter.patch("/age-range", handleUpdateAgeRange);
updateRouter.patch("/work-type", handleUpdateWorkType);
updateRouter.patch("/income-range", handleUpdateIncomeRange);
updateRouter.patch("/avatar", upload.single("avatar"), handleUpdateAvatar);

export default updateRouter;
