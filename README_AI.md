# ValidPanel Core Backend - AI Documentation

## Overview

**validpanel-backend** is the **multi-tenant platform orchestration and billing center** for the ValidPanel ecosystem. It manages:

1. **Stores** - Multi-tenant shop/marketplace management (users can own multiple stores)
2. **Authentication** - User/Admin identity & access control
3. **Subscriptions & Billing** - Plan management, pricing, payment processing, coupon system
4. **Users & Roles** - Admin management, permissions, role-based access
5. **Orders & Transactions** - Cross-service transaction tracking
6. **Infrastructure** - Email, notifications, webhooks, payment gateways

## Tech Stack

- **Runtime**: Node.js + TypeScript (strict mode)
- **Framework**: Express.js
- **ORM**: Prisma (PostgreSQL)
- **Validation**: Zod (runtime schema validation)
- **Payment Integrations**: Stripe, Paystack, Flutterwave
- **Database**: PostgreSQL with migrations
- **Architecture**: REST API + WebSockets (Socket.io)

## Directory Structure

```
src/
├── app.ts                 # Express app setup (middleware, routes)
├── index.ts              # Server entry point
├── config/               # Configuration files (db, env, stripe, etc.)
├── routes/               # Route definitions (auth, subscription, store, etc.)
├── controllers/          # Route handlers (request parsing, response)
├── services/             # Business logic
│   ├── subscription/     # Billing services (pricing, payment, finalization)
│   └── store/           # Store management
├── schemas/              # Zod validation schemas
├── middleware/           # Express middleware (auth, error handling)
├── providers/            # External service integrations (payment gateways)
├── emails/              # Email templates & sending
├── docs/                # Generated OpenAPI docs
└── utils/               # Shared utilities

prisma/
├── schema.prisma        # Data model definitions
├── migrations/          # Database schema versions
└── generated/           # Generated Prisma types
```

## Email Template System

### Structure

- `src/emails/index.ts`: central send helpers (`sendUserEmail`, `sendAdminEmail`, `sendEmailToAdmins`)
- `src/emails/templates/index.ts`: typed template registry mapping `type -> vars -> renderer`
- `src/emails/templates/*.templates.ts`: HTML fallback templates (code-level default)
- `email_templates` table: optional DB overrides for subject/content with `{{variable}}` interpolation
- `email_logs` table: delivery audit trail (SUCCESS/ERROR)

### How to Add a New Template

1. Add interface + renderer in `src/emails/templates/*.templates.ts` returning `TemplateResult`.
2. Export and register the template type in `src/emails/templates/index.ts` (`EmailTemplateVars` + `typedTemplates`).
3. Call one of the send helpers from a controller/service with the new template key and required vars.
4. Optionally create a DB template override in `email_templates` using the same `type` string.

### Production-Only Sending Rule

- Core service call sites must guard template dispatch with `if (env.NODE_ENV === "production")`.
- In non-production environments, keep behavior to logging/preview/testing only; do not trigger real outbound workflow emails.
- When implementing a new feature email, place the production guard at the business event call site (for example, payment finalized, subscription renewed).

## Payment Webhook Modularization

### Pattern

- Keep provider files in `src/providers/*.providers.ts` focused on three tasks only: signature verification, payload normalization, and delegation.
- Move gateway-agnostic business behavior (payment state updates, subscription/order/wallet effects, email notifications) into shared handlers under `src/services`.
- Core subscription flow delegates to `src/services/subscription/payment-webhook-handler.ts`.

### Metadata Contract

- Include gateway metadata required for downstream finalization in payment session creation.
- For subscription flows, pass `couponCode` in gateway metadata (`meta`/`meta_data`) so webhook finalization has full coupon context.
- Keep webhook schemas in `src/schemas/webhook.schema.ts` aligned with the metadata contract when adding new fields.

### Adding A New Gateway

1. Add provider integration file under `src/providers` for gateway-specific API calls and signature checks.
2. Reuse shared success/failure handlers instead of implementing business side effects in the provider.
3. Update webhook schema and metadata mapping once, then keep provider delegation thin.
4. Verify production-only email guards remain at business event boundaries.

## Core Models

### Store

```
{
  uid: string,
  name: string,
  owner: User,
  ownerId: number,
  plan: SubscriptionPlan | null,
  type: "SHOP" | "SMM" (store type),
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED",
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date | null
}

Note: `store.uid` is the store domain identifier (for example, `mybrand.validpanel.com` or a custom domain), not a UUID.
```

**Key Rule**: Every store has ONE owner. Multi-tenancy is enforced via `ownerId`.

### SubscriptionPlan

```
{
  uid: string,
  name: string,
  description: string,
  features: JSON (array of feature objects),
  gracePeriod: number (days after expiry to renew before deactivation),
  status: "ACTIVE" | "INACTIVE" | "DRAFT",
  prices: PlanPrice[],
  createdAt: Date,
  updatedAt: Date
}
```

**Key Rule**: Plans have prices for each (interval × currency) combination.

### PlanPrice

```
{
  planId: number,
  interval: "MONTHLY" | "YEARLY",
  price: Decimal,
  currency: string (e.g., "USD", "NGN", "EUR"),
  tax: number | null,
  amountInMinor: number (price * 100 for payment processing),
  externalId: string | null (Stripe product ID),
  isActive: boolean,
  isDefault: boolean (used for currency conversion fallback)
}
```

**Key Rule**: Pricing resolution is the single source of truth via `resolvePriceForSubscription()`.

### Subscription

```
{
  uid: string,
  userId: number,
  planId: number,
  billingCycle: "MONTHLY" | "YEARLY",
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED",
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Key Rule**: One ACTIVE subscription per user at a time. New subscriptions start PENDING until payment confirmed.

### Coupon

```
{
  uid: string,
  code: string (unique, case-insensitive),
  couponOwnerEmail: string | null (notification recipient; falls back to global admin email),
  type: "PERCENTAGE" | "FIXED",
  value: Decimal,
  currency: string | null (for FIXED coupons),
  maxUses: number | null (global limit),
  usedCount: number (global usage counter),
  perUserLimit: number | null (redemptions per user),
  firstTimeOnly: boolean,
  appliesTo: string[] (["NEW"] | ["NEW", "RENEWAL"] | ["NEW", "UPGRADE"], etc.),
  contexts: string[] (["HOME_PAGE"] | ["PRICING_PAGE"] | ["EMAIL"], etc.),
  startsAt: Date | null,
  expiresAt: Date | null,
  isPublic: boolean (shown on public pages),
  isActive: boolean,
  rules: CouponRule[] (per-plan, per-interval, per-currency rules)
}
```

**Key Rule**: Coupon application is validated in multiple dimensions (usage, time, context, rules).

### Payment & Transaction

```
Payment {
  uid: string,
  userId: number,
  amount: Decimal,
  currency: string,
  status: "PENDING" | "SUCCESS" | "FAILED",
  metadata: JSON (arbitrary data)
}

Transaction {
  uid: string,
  paymentId: number,
  type: "SUBSCRIPTION_PAYMENT" | "SUBSCRIPTION_RENEWAL" | "SUBSCRIPTION_UPGRADE",
  status: "PENDING" | "SUCCESS" | "FAILED",
  externalId: string | null (payment gateway transaction ID)
}
```

## Request/Response Pattern

### Incoming Request

1. **Express receives** HTTP request
2. **Middleware** validates JWT token → populates `req.auth` with `{ user: { id, uid, email } }` or `{ admin: { id, uid, role } }`
3. **Route handler (controller)** receives request
4. **Zod schema** validates request body/params/query
5. **Controller** calls appropriate service function

### Service Execution

1. **Service function** receives validated input
2. **Prisma queries** fetch/modify data
3. **Business logic** executes (e.g., coupon calculation)
4. **Database transaction** atomically updates multiple tables (if needed)
5. **Email/notification** sent (async)

### Response

- **Success**: `{ status: 200, data: { ... } }`
- **Validation Error**: `{ status: 400, error: { flatten: { fieldErrors: { ... } } } }`
- **Auth Error**: `{ status: 401, error: "Unauthorized" }`
- **Server Error**: `{ status: 500, error: "Internal Server Error" }`

## Feature Lifecycle: Subscription & Billing

### 1. User Registration → Store Creation → Subscribe

```
1. AuthController.register() → User created, JWT issued
2. StoreController.createStore() → Store created (ACTIVE)
3. SubscriptionController.initializeSubscription()
   → Subscription record created (PENDING)
   → PaymentController.createPaymentSession()
   → Redirect to payment gateway (Stripe/Paystack/Flutterwave)
```

### 2. Payment Processing

```
1. Payment gateway processes payment
2. Webhook → PaymentController.handlePaymentWebhook()
   → Verify transaction signature
   → FinalizeSubscriptionPayment.finalize()
   → Subscription marked ACTIVE
   → Email sent to user
```

### 3. Subscription Renewal

```
1. CRON job (or manual trigger) checks expiring subscriptions
2. RenewSubscriptio n initiated (NEW Subscription with status PENDING)
3. User confirms payment → Same payment flow as #2
4. FinalizeSubscriptionPayment.finalize(type: "RENEWAL")
   → Old subscription marked EXPIRED
   → New subscription marked ACTIVE
```

### 4. Subscription Upgrade

```
1. UpgradePlanController.upgrade()
   → User selects new plan
   → New Subscription created (PENDING, newPlanId set)
2. Payment computed (pro-rated if mid-cycle)
3. User confirms payment
4. FinalizeSubscriptionPayment.finalize(type: "UPGRADE", newPlanId)
   → Old subscription marked EXPIRED (or pro-rated end date)
   → New subscription marked ACTIVE with calculated expiry
```

### 5. Coupon Application

```
1. During payment initialization:
   - CouponController.validateCoupon(code)
   - Check: active, not expired, usage limits, per-user limit, appliesTo, rules
   - ComputeCouponDiscountAmount(amount, coupon, type)
   - Deduct from total price
   - Store couponRedemption record (atomically with payment)
```

## Key Services

### 1. Pricing Resolution Service

**File**: `src/services/subscription/pricing-resolution.ts`

Resolves the exact price for a subscription request:

```typescript
resolvePriceForSubscription({
  planId: 5,
  interval: "MONTHLY",
  currency: "NGN",
});
// Returns:
// {
//   id: 12,
//   price: Decimal(5000),
//   amountInMinor: 500000,
//   externalId: "stripe_price_123",
//   ...
// }
```

**Logic**:

1. Validate plan exists and is ACTIVE
2. Find exact price for (planId, interval, currency)
3. If not found: use default price and convert currency
4. If no default exists: throw error

**Critical Rule**: This is the **single source of truth** for all pricing lookups. Never hardcode prices or compute from tables directly.

### 2. Subscription Payment Service

**File**: `src/services/subscription/payment.services.ts`

Creates a billing event (payment + transaction) for subscription:

```typescript
createSubscriptionPayment(user, "SUBSCRIPTION_PAYMENT", {
  planId: 5,
  billingCycle: "MONTHLY",
  currency: "NGN",
  platform: "PAYSTACK",
  couponCode: "SAVE20",
  redirectUrl: "...",
});
```

**Logic**:

1. Resolve price (via pricing resolution service)
2. Apply coupon (if provided)
3. Compute pricing breakdown (amount, tax, discount, final)
4. Create Payment record (PENDING)
5. Create Transaction record (PENDING)
6. Initialize payment gateway (Stripe/Paystack/Flutterwave)
7. Return payment link to client

### 3. Finalize Subscription Payment

**File**: `src/services/subscription/finalize-subscription-payment.ts`

Atomically finalizes a payment after gateway confirmation:

```typescript
finalizeSubscriptionPayment({
  subscriptionId: 42,
  userId: 3,
  paymentId: 88,
  transactionId: 99,
  type: "SUBSCRIPTION_UPGRADE",
  newPlanId: 7,
  billingCycle: "MONTHLY",
});
```

**Logic** (idempotent):

1. Validate user/subscription/payment/transaction ownership
2. Check if already finalized (idempotent exit)
3. Calculate subscription expiry
4. If UPGRADE: calculate pro-rated dates, expire old subscription
5. Mark Payment & Transaction as SUCCESS
6. Mark Subscription as ACTIVE with new expiry
7. Create PaymentNotification
8. Advance onboarding state (if applicable)
9. Send confirmation email

**Critical Rule**: This is idempotent. Can be called multiple times safely (e.g., for failed webhook retries).

## Routes Overview

### Authentication (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login & receive JWT
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Subscriptions (`/subscriptions`)

- `GET /subscriptions` - Get user's current subscription
- `GET /subscriptions/active` - Get active subscription
- `POST /subscriptions` - Create new subscription (initiate payment)
- `GET /subscriptions/{uid}` - Get subscription details
- `PUT /subscriptions/{uid}` - Update subscription
- `POST /subscriptions/{uid}/upgrade` - Upgrade plan
- `POST /subscriptions/{uid}/downgrade` - Downgrade plan
- `POST /subscriptions/{uid}/renew` - Renew expiring subscription
- `POST /subscriptions/{uid}/cancel` - Cancel subscription

### Subscription Plans (`/subscription-plans`)

- `GET /subscription-plans` - List all active plans (public)
- `GET /subscription-plans/{uid}` - Get plan details (public)
- `POST /subscription-plans` - Create plan (admin only)
- `PUT /subscription-plans/{uid}` - Update plan (admin only)

### Coupons (`/coupons`)

- `GET /coupons/public` - List public coupons (context-aware)
- `GET /coupons/validate?code=SAVE20` - Validate coupon for current user
- `POST /coupons` - Create coupon (admin only)
- `GET /coupons/{uid}` - Get coupon details (admin only)
- `PUT /coupons/{uid}` - Update coupon (admin only)

### Payments (`/payments`)

- `POST /payments/webhook` - Payment gateway webhook (Stripe/Paystack/Flutterwave)
- `GET /payments` - List user's payments
- `GET /payments/{uid}` - Get payment details

### Stores (`/stores`)

- `POST /stores` - Create store
- `GET /stores/me` - Get user's stores
- `GET /stores/{uid}` - Get store details
- `PUT /stores/{uid}` - Update store
- `DELETE /stores/{uid}` - Delete store

### Admin (`/admin/...`)

- `GET /admin/users` - List all users (admin only)
- `GET /admin/stores` - List all stores (admin only)
- `POST /admin/orders` - Create order (admin only)
- `PUT /admin/coupons/{uid}` - Manage coupons (admin only)
- `GET /admin/payments` - View all payments (admin only)

## Error Handling Pattern

### Backend Errors

```typescript
// In controller:
const parsed = CouponApplySchema.safeParse(req.body);
if (!parsed.success) {
  res.status(400).json({ error: parsed.error.flatten() });
  return;
}

// In service:
if (!coupon || !coupon.isActive) {
  throw new Error("Invalid or inactive coupon");
}

// Middleware catches and formats:
// { status: 400, error: "Invalid or inactive coupon" }
```

### Frontend Error Normalization

Hooks use `normalizeApiError(error, "Default message")` to convert backend errors to toast messages.

## Feature Development Lifecycle

### Complete Implementation Checklist

When implementing a new feature in validpanel-backend, follow these 7 steps in order:

#### Step 1: Database Schema

Update `prisma/schema.prisma` with new models or fields, then:

```bash
npm run prisma:generate
npm run prisma:migrate
```

#### Step 2: Zod Validation Schema

Create schema in `src/schemas/<feature>.schema.ts`:

```typescript
import { z } from "zod";

export const CreateCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountPercent: z.number().min(1).max(100),
  maxUses: z.number().min(1),
  expiresAt: z.date(),
});

export type CreateCouponInput = z.infer<typeof CreateCouponSchema>;
```

#### Step 3: Rate Limiting

Create rate limiter in `src/middleware/ratelimit/coupon.ratelimit.ts`:

```typescript
import { rateLimit } from "express-rate-limit";
import { devBypass } from "./utils";

export const limitCouponCreate = devBypass(
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 coupons per hour
    message: "Too many coupons created",
  }),
);

export const limitCouponView = devBypass(
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200, // 200 views per 5 min
  }),
);
```

Export in `src/middleware/ratelimit/index.ts`:

```typescript
export * from "./coupon.ratelimit";
```

#### Step 4: Controller

Create controller in `src/controllers/coupon.controller.ts`:

```typescript
import { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { CreateCouponSchema } from "../schemas/coupon.schema";
import { checkAdminPermission } from "../middleware/permission";

export async function createCoupon(req: Request, res: Response) {
  try {
    // 1. Validate input
    const parsed = CreateCouponSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    // 2. Check subscription active (for validpanel-backend, check internal)
    // For admin operations, user is already authenticated

    // 3. Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        discountPercent: parsed.data.discountPercent,
        maxUses: parsed.data.maxUses,
        expiresAt: parsed.data.expiresAt,
        createdBy: req.auth.id,
      },
      select: {
        id: true,
        code: true,
        discountPercent: true,
        maxUses: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created",
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

#### Step 5: Swagger/OpenAPI Documentation

Create paths in `src/docs/paths/coupon.paths.ts`:

```typescript
import { registry } from "../components/registry";
import { CreateCouponSchema } from "../../schemas/coupon.schema";
import { CreateCouponResponse } from "../responses/coupon.response";
import {
  BadRequest,
  Forbidden,
  ServerError,
} from "../responses/common.response";

registry.registerPath({
  method: "post",
  path: "/admins/coupons",
  summary: "Create coupon",
  tags: ["Coupons"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCouponSchema,
        },
      },
    },
  },
  responses: {
    201: CreateCouponResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
```

Create response definitions in `src/docs/responses/coupon.response.ts` and import them into the path file, matching existing files like `user.response.ts` and `admin.response.ts`.

Import in `src/docs/swagger.ts`:

```typescript
import "./paths/coupon.paths";
```

#### Step 6: Route Definition with Permission Middleware

Define route in `src/routes/coupon.routes.ts`:

```typescript
import { Router } from "express";
import { authenticateAdmin } from "../middleware/auth";
import { checkAdminPermission } from "../middleware/permission";
import { limitCouponCreate, limitCouponView } from "../middleware/ratelimit";
import * as couponController from "../controllers/coupon.controller";

const router = Router();

// Public view (no auth, rate limited)
router.get("/public/:code", limitCouponView, couponController.getCouponByCode);

// Admin view (auth + permission + rate limit)
router.get(
  "/",
  authenticateAdmin, // 1. Verify admin identity
  checkAdminPermission(["VIEW_COUPONS"]), // 2. Check permission (VIEW_ENTITY pattern)
  limitCouponView, // 3. Rate limit
  couponController.getCoupons, // 4. Controller
);

// Admin create (auth + permission + rate limit)
router.post(
  "/",
  authenticateAdmin, // 1. Verify admin identity
  checkAdminPermission(["MANAGE_COUPONS"]), // 2. Check permission (MANAGE_ENTITY pattern)
  limitCouponCreate, // 3. Rate limit
  couponController.createCoupon, // 4. Controller
);

// Admin update (auth + permission + rate limit)
router.patch(
  "/:couponId",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_COUPONS"]),
  limitCouponCreate,
  couponController.updateCoupon,
);

// Admin delete (auth + permission + strict rate limit)
router.delete(
  "/:couponId",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_COUPONS"]),
  limitCouponDelete,
  couponController.deleteCoupon,
);

export default router;
```

Register in `src/app.ts`:

```typescript
import couponRoutes from "./routes/coupon.routes";
app.use("/api/admin/coupons", dynamicCors, couponRoutes);
```

### Permission Middleware Pattern (ValidPanel-Backend Specific)

ValidPanel-backend uses a **permission-based access control** pattern. Always enforce permissions on admin routes:

#### Permission Format

- **Pattern**: `VERB_ENTITY` (e.g., `VIEW_USERS`, `MANAGE_ADMINS`)
- **Verbs**: VIEW (read), MANAGE (create/update), DELETE (remove)
- **Entities**: USERS, ADMINS, COUPONS, ROLES, SHOPS, etc.

#### Examples

```typescript
// View permissions (read-only)
checkAdminPermission(["VIEW_USERS"]);
checkAdminPermission(["VIEW_ADMINS"]);
checkAdminPermission(["VIEW_COUPONS"]);

// Manage permissions (create/update)
checkAdminPermission(["MANAGE_USERS"]);
checkAdminPermission(["MANAGE_COUPONS"]);
checkAdminPermission(["MANAGE_ROLES"]);

// Multiple permissions (all required)
checkAdminPermission(["VIEW_USERS", "MANAGE_COUPONS"]);

// Bypass all checks
checkAdminPermission(["ALL_ACCESS"]);
```

#### Permission Middleware Implementation

See `src/middleware/permission.ts` for the implementation. It:

1. Verifies admin identity from `req.auth`
2. Fetches admin's role from database
3. Checks if admin has required permissions
4. Allows if permission matches OR admin has `ALL_ACCESS`

### Summary Checklist

- [ ] **Step 1**: Update Prisma schema and generate
- [ ] **Step 2**: Create Zod validation schema
- [ ] **Step 3**: Implement rate limiters
- [ ] **Step 4**: Implement controller with validation
- [ ] **Step 5**: Register Swagger/OpenAPI paths
- [ ] **Step 6**: Define routes with middleware: auth → permission → rate limit → controller

## Critical Rules

1. **Multi-Tenancy**: No implicit assumption of shopId/storeId. Validate user ownership explicitly:

   ```typescript
   const store = await prisma.store.findFirst({
     where: { uid, ownerId: user.id },
   });
   ```

2. **Pricing is Source of Truth**: Always use `resolvePriceForSubscription()`, never hardcode or compute independently.

3. **Coupon Application**: Run in database transaction; atomically create CouponRedemption with Payment.

4. **Subscription Lifecycle**: Never directly mark subscription ACTIVE without payment confirmation. Always use `finalizeSubscriptionPayment()`.

5. **Idempotency**: Payment webhook handlers must be idempotent. Check if payment already SUCCESS before retrying.

6. **Validation**: Use Zod schemas for all inputs. Never trust frontend data.

7. **Authentication**: Extract user from `req.auth.user` (set by AuthMiddleware). Never query based on request body user ID alone.

8. **Error Responses**: Always return structured errors with status codes and messages (never expose stack traces to client).

## Integration with Shop/SMM Services

- **shop-backend** & **social-media-store-backend** send subscription verification calls to validpanel-backend
- They check if `userId` has an ACTIVE subscription before allowing store access
- They may fetch store details from validpanel-backend for display purposes
- Payment webhooks are processed by validpanel-backend, which notifies shop/SMM services via webhooks

## Common Commands

```bash
# Development
npm run dev           # Start dev server with hot reload

# Database
npm run dev:migrate   # Run migrations (dev)
npm run migrate       # Run migrations (production)
npx prisma studio    # Open Prisma Studio (DB browser)

# Type Generation
npx prisma generate  # Regenerate Prisma types after schema changes

# Build & Deploy
npm run build         # Production build
npm run lint          # Run linter
npm run typecheck     # TypeScript type checking
```

## Debugging Tips

1. **Database Queries**: Enable Prisma logging in `.env`:

   ```
   DATABASE_LOG_LEVEL=query
   ```

   Queries will print to console during dev.

2. **Payment Gateway**: Check webhook logs in Stripe/Paystack dashboards.

3. **Coupon Issues**: Check `CouponRedemption` table for usage; coupon rules in `Coupon.rules`.

4. **Subscription Expiry**: `Subscription.expiresAt` is key; renewal logic checks `expiresAt < now`.

---

**Next**: See [.github/copilot-instructions.md](./.github/copilot-instructions.md) for feature implementation rules.
