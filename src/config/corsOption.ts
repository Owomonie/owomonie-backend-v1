const allowedOrigins = [
  "http://localhost:5173",
  "https://owomonie-admin-v1.vercel.app",
  "https://expo.dev/accounts/yommexg/projects/owomonie/builds/689ffa0a-a3b9-4a8c-a0e3-ba54d5e23ede",
];

import { CorsOptions } from "cors";

const isAllowedOrigin = (origin: string | undefined): boolean => {
  // Check if the origin is in the allowedOrigins array
  return allowedOrigins.includes(origin as string);
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || !isAllowedOrigin(origin)) {
      // Reject requests with disallowed origins
      callback(new Error("Not allowed by CORS"));
    } else {
      callback(null, true);
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

export default corsOptions;
