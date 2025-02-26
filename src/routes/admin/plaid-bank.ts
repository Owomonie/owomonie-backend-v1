import { Request, Router } from "express";
import multer, { FileFilterCallback, MulterError } from "multer";
import { handleCreatePLaidBankLogo } from "../../controllers/plaid-banks/upload-bank-logo";
import { handleFireTestWebhookSyncTxn } from "../../controllers/plaid-banks/fire-webhook";
import { handleGetAllTransactions } from "../../controllers/plaid-banks/get-all-banks-info";

const adminPlaidBankRouter = Router();

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
    fileSize: 5000000,
    files: 1,
  },
});

adminPlaidBankRouter.post(
  "/create-plaid-logo",
  upload.single("plaid-bank-logo"),
  handleCreatePLaidBankLogo
);

adminPlaidBankRouter.post(
  "/fire-test-webhook/sync-transaction",
  handleFireTestWebhookSyncTxn
);

adminPlaidBankRouter.get("/get-all-transactions", handleGetAllTransactions);

export default adminPlaidBankRouter;
