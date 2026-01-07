import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import { env } from "./config/env.config";
import cookieParser from "cookie-parser";
import path from "path";
import { apiLimiter } from "./middleware/ratelimit";
import PrismaSessionStore from "./utils/PrismaSessionStore";
import { corsOptions, openCors } from "./config/cors.config";

// Routes
import swaggerRouter from "./docs/swagger";
import userRouter from "./routes/user.routes";
import adminRouter from "./routes/admin.routes";
import orderRouter from "./routes/order.routes";
import storeRouter from "./routes/store.routes";
import webhookRouter from "./routes/webhook.routes";
import paymentGatewayRouter from "./routes/paymentGateway.routes";
import notificationRouter from "./routes/notification.routes";
import subscriptionPlanRouter from "./routes/subscriptionPlan.routes";
import subscriptionRouter from "./routes/subscription.routes";
import settingRouter from "./routes/setting.routes";
import filesRouter from "./routes/files.routes";
import paymentRouter from "./routes/payment.routes";
import transactionRouter from "./routes/transaction.routes";
import rateRouter from "./routes/rate.routes";
import contactRouter from "./routes/contact.routes";
import authRoutes from "./routes/auth.routes";

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
app.use("/api/v1/users", corsOptions, userRouter);
app.use("/api/v1/stores", corsOptions, storeRouter);
app.use("/api/v1/admins", corsOptions, adminRouter);
app.use("/api/v1/orders", corsOptions, orderRouter);
app.use("/api/v1/webhooks", corsOptions, webhookRouter);
app.use("/api/v1/payment-gateways", corsOptions, paymentGatewayRouter);
app.use("/api/v1/subscriptions", corsOptions, subscriptionRouter);
app.use(
  "/api/v1/subscription-plans",
  corsOptions,
  subscriptionPlanRouter
);
app.use("/api/v1/notifications", corsOptions, notificationRouter);
app.use("/api/v1/setting", corsOptions, settingRouter);
app.use("/api/v1/payments", corsOptions, paymentRouter);
app.use("/api/v1/transactions", corsOptions, transactionRouter);
app.use("/api/v1/files", corsOptions, filesRouter);
app.use("/api/v1/rates", corsOptions, rateRouter);
app.use("/api/v1/contact", corsOptions, contactRouter);

// --- Docs ---
app.use("/swagger", swaggerRouter);

// Auth Routes (this is for the auth.vaalidpanel.com domain to handle OAuth)
app.use("/api/auth/core", corsOptions, authRoutes);

export default app;
