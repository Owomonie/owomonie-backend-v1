const allowedOrigins = [
  // "http://localhost:5173",
  "https://owomonie-admin-v1.vercel.app",
  // "http://localhost:8081",
  // "exp://192.168.179.251:8081",
  // "http://192.168.179.251:8081/",
  "http://192.168.179.251:8081/_expo/loading",
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
