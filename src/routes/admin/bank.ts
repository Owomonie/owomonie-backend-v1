import { Request, Router } from "express";
import multer, { FileFilterCallback, MulterError } from "multer";
import { handleCreateNewBank } from "../../controllers/banks/create-bank";
import { handleDeleteBank } from "../../controllers/banks/delete-bank";

const bankRouter = Router();

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

bankRouter.post("/add", upload.single("bank-logo"), handleCreateNewBank);
bankRouter.delete("/delete/:bankId", handleDeleteBank);

export default bankRouter;
