import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { env } from "./config/env.config";
import cookieParser from "cookie-parser";
import path from "path";
import { apiLimiter } from "./middleware/ratelimit";
import PrismaSessionStore from "./utils/PrismaSessionStore";
import { openCors, dynamicCors } from "./config/cors.config";

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
import emailRouter from "./routes/email.routes";
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
app.use("/v1/users", dynamicCors, userRouter);
app.use("/v1/stores", dynamicCors, storeRouter);
app.use("/v1/admins", dynamicCors, adminRouter);
app.use("/v1/orders", dynamicCors, orderRouter);
app.use("/v1/webhooks", dynamicCors, webhookRouter);
app.use("/v1/payment-gateways", dynamicCors, paymentGatewayRouter);
app.use("/v1/subscriptions", dynamicCors, subscriptionRouter);
app.use("/v1/subscription-plans", dynamicCors, subscriptionPlanRouter);
app.use("/v1/notifications", dynamicCors, notificationRouter);
app.use("/v1/setting", dynamicCors, settingRouter);
app.use("/v1/payments", dynamicCors, paymentRouter);
app.use("/v1/transactions", dynamicCors, transactionRouter);
app.use("/v1/files", dynamicCors, filesRouter);
app.use("/v1/rates", dynamicCors, rateRouter);
app.use("/v1/contact", dynamicCors, contactRouter);
app.use("/v1/emails", dynamicCors, emailRouter);

// Webhook Routes (no CORS - these are called by external services)
app.use("/v1/webhooks", openCors, webhookRouter);

// --- Docs ---
app.use("/swagger", swaggerRouter);

// Auth Routes (this is for the auth.vaalidpanel.com domain to handle OAuth)
app.use("/api/auth/core", openCors, authRoutes);

export default app;
