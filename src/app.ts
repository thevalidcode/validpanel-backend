import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { env } from "./config/env.config";
import cookieParser from "cookie-parser";
import path from "path";
import { apiLimiter } from "./middleware/ratelimit";
import PrismaSessionStore from "./utils/PrismaSessionStore";
import { corsOptions } from "./config/cors.config";

// Routes
import userRouter from "./routes/user.routes";
import adminRouter from "./routes/admin.routes";
import storeRouter from "./routes/store.routes";
import swaggerRouter from "./docs/swagger";
import serviceApiProviderRouter from "./routes/serviceApiProvider.routes";

const app = express();

// --- Middleware ---
app.use(bodyParser.json());
app.use(cookieParser());
app.use(apiLimiter);
app.use(express.urlencoded({ extended: true }));
app.use(
  "/assets",
  express.static(path.join(__dirname, "..", "public", "assets"))
);

app.set("trust proxy", 1);

app.use(
  session({
    store: new PrismaSessionStore(),
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// --- Public Routes ---
app.use("/api/v1/users", cors(corsOptions), userRouter);
app.use("/api/v1/stores", cors(corsOptions), storeRouter);
app.use("/api/v1/admins", cors(corsOptions), adminRouter);
app.use(
  "/api/v1/service-api-providers",
  cors(corsOptions),
  serviceApiProviderRouter
);

// --- Docs ---
app.use("/swagger", swaggerRouter);

export default app;
