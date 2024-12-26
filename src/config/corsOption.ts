const allowedOrigins = [
  "exp+owomonie://expo-development-client/?url=http%3A%2F%2F192.168.179.251%3A8081",
  "exp://192.168.179.251:8081",
  "http://localhost:8081",
  "https://owomonie-admin-v1.vercel.app",
];

import { CorsOptions } from "cors";

const isAllowedOrigin = (origin: string | undefined): boolean => {
  // Check if the origin is in the allowedOrigins array
  return allowedOrigins.includes(origin as string);
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || !isAllowedOrigin(origin)) {
      console.log(origin);
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
