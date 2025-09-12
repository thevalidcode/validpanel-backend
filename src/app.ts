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
import serviceApiProviderRouter from "./routes/serviceApiProvider.routes";
import settingRouter from "./routes/setting.routes";
import paymentRouter from "./routes/payment.routes";
import transactionRouter from "./routes/transaction.routes";

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
app.use("/api/v1/orders", cors(corsOptions), orderRouter);
app.use("/api/v1/webhooks", cors(corsOptions), webhookRouter);
app.use("/api/v1/payment-gateways", cors(corsOptions), paymentGatewayRouter);
app.use(
  "/api/v1/service-api-providers",
  cors(corsOptions),
  serviceApiProviderRouter
);
app.use("/api/v1/subscriptions", cors(corsOptions), subscriptionRouter);
app.use(
  "/api/v1/subscription-plans",
  cors(corsOptions),
  subscriptionPlanRouter
);
app.use("/api/v1/notifications", cors(corsOptions), notificationRouter);
app.use("/api/v1/setting", cors(corsOptions), settingRouter);
app.use("/api/v1/payments", cors(corsOptions), paymentRouter);
app.use("/api/v1/transactions", cors(corsOptions), transactionRouter);

// --- Docs ---
app.use("/swagger", swaggerRouter);

export default app;
