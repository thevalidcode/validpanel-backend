import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { env } from "./config/env.config";
import cookieParser from "cookie-parser";
import path from "path";
import { apiLimiter } from "./middleware/ratelimit";
import PrismaSessionStore from "./utils/PrismaSessionStore";

// Routes
import userRouter from "./routes/user.routes";
import adminRouter from "./routes/admin.routes";
import swaggerRouter from "./docs/swagger";
import { corsOptions } from "./config/cors.config";

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
app.use("/api/v1/user", cors(corsOptions), userRouter);
app.use("/admin", adminRouter);

// --- Docs ---
app.use(swaggerRouter);

export default app;
