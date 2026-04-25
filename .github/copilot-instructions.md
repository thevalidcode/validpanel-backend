# ValidPanel Core Backend - Copilot Instructions

**Service**: Multi-tenant platform orchestration & billing center  
**Tech Stack**: Node.js, Express, Prisma, TypeScript, Zod, PostgreSQL  
**Scope**: Stores, Users, Subscriptions, Payments, Coupons, Admin Management

## Multi-Tenancy Pattern

### Critical Rule: Implicit Owner Context
- `validpanel-backend` operates at **user/org level**, NOT service level (unlike shop/SMM)
- No query should have a raw `shopId` or `storeId` filter
- Every resource (Store, Subscription, Payment) is implicitly scoped to `req.auth.user.id`

### Implementation Pattern

```typescript
// ✅ CORRECT: Fetch store for authenticated user
const store = await prisma.store.findFirst({
  where: { uid: storeUid, ownerId: authUser.id }  // implicit owner check
});

// ❌ WRONG: Missing owner check
const store = await prisma.store.findUnique({
  where: { uid: storeUid }  // Could fetch someone else's store!
});

// ✅ CORRECT: Get user's subscriptions
const subscriptions = await prisma.subscription.findMany({
  where: { userId: authUser.id }  // implicit user scoping
});

// ✅ CORRECT: Admin operations (explicit admin auth)
const allStores = await prisma.store.findMany({});  // OK only if admin verified
```

### Tenant Isolation Checklist
- [ ] Every user-facing query includes `ownerId: user.id` or `userId: user.id`
- [ ] No "Me" endpoint returns other users' data
- [ ] Admin routes are explicitly gated with `AdminAuthSchema` validation
- [ ] Webhook handlers validate ownership (e.g., payment belongs to user)

## Subscription & Billing Rules

### 1. Pricing Resolution (Single Source of Truth)
**ALWAYS** use `resolvePriceForSubscription()`:

```typescript
import { resolvePriceForSubscription } from "./services/subscription/pricing-resolution";

// ✅ CORRECT
const price = await resolvePriceForSubscription({
  planId: 5,
  interval: "MONTHLY",
  currency: "NGN"
});
// Returns: { id, price, amountInMinor, externalId, ... }

// ❌ WRONG: Hardcoding or computing prices directly
const amount = planPrice.price * 100;  // Don't do this
```

**Why**: The service handles currency conversion fallback, validation, and ensures consistency.

### 2. Subscription Lifecycle States
```
PENDING         ← New subscription created, awaiting payment
              ↓
           ACTIVE         ← Payment confirmed, subscription active
              ↓
         (use for ~2 months)
              ↓
           EXPIRED        ← expiresAt reached, grace period passed
              ↓
        (renewal available)

            CANCELLED      ← User cancelled, not renewed
```

**Rules**:
- Only ONE subscription can be ACTIVE per user at any time
- New subscriptions always start PENDING (never directly ACTIVE)
- Subscription marked ACTIVE only via `finalizeSubscriptionPayment()`
- EXPIRED subscriptions can be renewed (create new PENDING subscription)

### 3. Payment Finalization (Idempotent)
```typescript
import { finalizeSubscriptionPayment } from "./services/subscription/finalize-subscription-payment";

// ✅ CORRECT: After payment gateway confirmation
await finalizeSubscriptionPayment({
  subscriptionId: 42,
  userId: 3,
  paymentId: 88,
  transactionId: 99,
  type: "SUBSCRIPTION_PAYMENT",  // or RENEWAL, UPGRADE
  amount: new Decimal(5000),
  billingCycle: "MONTHLY"
});

// ❌ WRONG: Manually marking subscription ACTIVE
await prisma.subscription.update({
  where: { id: 42 },
  data: { status: "ACTIVE" }  // Don't do this; use finalize()
});
```

**Why**: `finalize()` atomically handles:
- Validating payment success
- Calculating expiry dates
- Handling plan upgrades
- Expiring old subscriptions
- Sending emails
- Idempotency (safe for webhook retries)

### 4. Coupon Application
Coupons are applied **during payment initialization**, not checkout:

```typescript
// In payment service:
const { coupon, discountAmount } = await applyCouponToAmount(tx, {
  couponCode: "SAVE20",
  amount: finalPrice,
  currency: "NGN",
  userId: user.id,
  planId: 5,
  billingCycle: "MONTHLY",
  appliesTo: "NEW"  // Transaction type
});

// Atomically create CouponRedemption + Payment in same transaction
await tx.couponRedemption.create({
  data: { couponId: coupon.id, userId: user.id, ... }
});
await tx.payment.create({
  data: { finalAmount: finalPrice - discountAmount, ... }
});
```

**Coupon Types**:
- `appliesTo` (validates when coupon can be used):
  - "NEW" → First-time subscriptions only
  - "RENEWAL" → Subscription renewals only
  - "UPGRADE" → Plan upgrades only
- `contexts` (validates where coupon is displayed):
  - "HOME_PAGE", "PRICING_PAGE", "EMAIL", etc.
- Per-user limits (`perUserLimit`, `firstTimeOnly`)
- Global limits (`maxUses`)
- Time windows (`startsAt`, `expiresAt`)

### 5. Transaction Types
```typescript
enum TransactionType {
  SUBSCRIPTION_PAYMENT  = "NEW" subscription
  SUBSCRIPTION_RENEWAL   = Plan renewal (renew existing)
  SUBSCRIPTION_UPGRADE   = Plan change to higher tier
  SUBSCRIPTION_DOWNGRADE = Plan change to lower tier (if supported)
}
```

## Controllers & Routes

### Authentication Controller
```typescript
// ✅ Pattern: Extract user, validate schema, handle error
export const register = async (req: Request, res: Response) => {
  const parsed = UserRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const user = await userService.register(parsed.data);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
```

**Rules**:
- Extract `req.auth` for authenticated endpoints
- ALWAYS validate input with Zod schema
- Return structured error responses
- Never expose stack traces

### Subscription Controller
```typescript
export const createSubscription = async (req: Request, res: Response) => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const bodyParsed = SubscriptionPaymentSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  try {
    const result = await paymentServices.createSubscriptionPayment(
      authParsed.data.user,
      "SUBSCRIPTION_PAYMENT",
      bodyParsed.data
    );
    res.status(200).json(result);  // { status: "pending", paymentLink: "..." }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
```

## Services Implementation

### When to Create a Service File
- Logic used by multiple controllers
- Complex multi-step operations (e.g., subscription creation)
- External API calls (payment gateways)
- Database transactions

### Service Template
```typescript
import { prisma } from "../config/db.config";

export const myComplexOperation = async (input: MyInput): Promise<MyOutput> => {
  return prisma.$transaction(async (tx) => {
    // 1. Validate inputs
    // 2. Fetch related data
    // 3. Perform calculations
    // 4. Update records atomically
    // 5. Send emails/notifications (async)
    // 6. Return result
  });
};
```

**Rules**:
- Use `prisma.$transaction()` for multi-step updates
- Validate data before updating (Zod in controller, business logic in service)
- Throw descriptive errors
- Return serializable objects (no Prisma instances in public APIs)

## Webhook Handlers

### Payment Gateway Webhooks
```typescript
export const handlePaymentWebhook = async (req: Request, res: Response) => {
  // 1. Verify webhook signature (prevent spoofing)
  const isValid = verifyPaystackSignature(req.body, req.headers["x-paystack-signature"]);
  if (!isValid) {
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  // 2. Extract payment reference
  const { reference } = req.body;

  // 3. Find payment + transaction (idempotent check)
  const payment = await prisma.payment.findUnique({
    where: { externalId: reference }
  });

  if (!payment) {
    // Log & continue (webhook may be for old payment)
    console.warn("Payment not found:", reference);
    res.status(200).json({ status: "ok" });  // Always return 200 to gateway
    return;
  }

  if (payment.status === "SUCCESS") {
    // Already processed (idempotent)
    res.status(200).json({ status: "ok" });
    return;
  }

  // 4. Update payment + finalize subscription
  try {
    await finalizeSubscriptionPayment({
      subscriptionId: payment.subscriptionId,
      userId: payment.userId,
      paymentId: payment.id,
      transactionId: payment.transactionId,
      type: "SUBSCRIPTION_PAYMENT"
    });
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Webhook finalization failed:", err);
    res.status(500).json({ error: err.message });  // Should NOT happen
  }
};
```

**Rules**:
- ALWAYS verify webhook signature
- ALWAYS check if payment already processed (idempotency)
- ALWAYS return HTTP 200 (gateway doesn't care about result, only that we received it)
- Log failures for debugging (retry manually if needed)

## Database Transactions

### When to Use
- Multiple related updates (e.g., subscription + payment + coupon redemption)
- Need atomicity and rollback safety

### Pattern
```typescript
return prisma.$transaction(async (tx) => {
  // All operations use 'tx' instead of 'prisma'
  
  const subscription = await tx.subscription.create({...});
  const payment = await tx.payment.create({...});
  const coupenRedemption = await tx.couponRedemption.create({...});
  
  // If any fails, entire transaction rolls back
  return { subscription, payment };
});
```

## Validation Schema Pattern

### Input Schemas (Zod)
```typescript
// schemas/subscription.schema.ts

export const SubscriptionPaymentSchema = z.object({
  planId: z.number().int().positive(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  currency: z.string().length(3).toUpperCase(),
  platform: z.enum(["STRIPE", "PAYSTACK", "FLUTTERWAVE"]),
  couponCode: z.string().optional(),
  redirectUrl: z.string().url()
});

export type SubscriptionPaymentInput = z.infer<typeof SubscriptionPaymentSchema>;
```

## Admin Routes

### Pattern
```typescript
export const getUsers = async (req: Request, res: Response) => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Admin verified; proceed with unrestricted query
  const users = await prisma.user.findMany({});
  res.status(200).json(users);
};
```

**Rules**:
- Always validate with `AdminAuthSchema` (not `AuthSchema`)
- Admin routes should be clearly marked
- Audit log admin actions (optional but recommended)

## Error Handling

### Error Types
```typescript
// Zod validation error
{ error: { flatten: { fieldErrors: { email: ["Invalid email"] } } } }

// Business logic error
{ error: "Invalid or inactive coupon" }

// Not found
{ status: 404, error: "Subscription not found" }

// Auth error
{ status: 401, error: "Unauthorized" }

// Server error
{ status: 500, error: "Internal Server Error" }
```

### Error Propagation
```typescript
// Service throws → Controller catches → Responds
try {
  await service.operation();
} catch (err: any) {
  res.status(500).json({ error: err.message });
}
```

## Common Patterns to Avoid

❌ **Direct subscription activation** (without finalize):
```typescript
// WRONG
await prisma.subscription.update({
  where: { id },
  data: { status: "ACTIVE" }
});
```

❌ **Hardcoded prices**:
```typescript
// WRONG
const amountInMinor = 500000;  // Don't hardcode
```

❌ **Missing owner validation**:
```typescript
// WRONG
const store = await prisma.store.findUnique({ where: { uid } });
```

❌ **Manual coupon discount calculation**:
```typescript
// WRONG
const discount = price * (coupon.value / 100);  // Use computeCouponDiscountAmount()
```

❌ **Non-idempotent webhook handlers**:
```typescript
// WRONG: Processes webhook even if payment already SUCCESS
await finalizeSubscriptionPayment(...);  // No check first
```

## Feature Implementation Checklist

When implementing a new **subscription-related** feature:

- [ ] Define Zod schema for input validation
- [ ] Create controller (or extend existing)
- [ ] Add route to `routes/subscription.routes.ts`
- [ ] Create service function (if complex logic)
- [ ] Use `resolvePriceForSubscription()` for pricing
- [ ] Use `finalizeSubscriptionPayment()` for payment finalization
- [ ] Validate ownership (user.id or admin role)
- [ ] Handle errors with proper status codes
- [ ] Write idempotent logic (for webhook retries)
- [ ] Add database migration if schema changed
- [ ] Test with Postman/curl locally
- [ ] Update `.env.example` if needed
- [ ] Document in README_AI.md

## Local Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev --name <feature>

# Start dev server (auto-reload)
npm run dev

# Run Prisma Studio (DB browser)
npx prisma studio

# Type check
npm run typecheck

# Lint
npm run lint
```

## Testing Payments Locally

### Paystack Sandbox
- Test card: `5531 8866 5778 4850`
- CVV: `123`
- Expiry: Any future date
- OTP: `123456`

### Flutterwave Sandbox
- Card: `5531 8866 5778 4850` (Visa)
- OTP: `12345`

## Deployment

```bash
# Production build
npm run build

# Run migrations (required before deploy)
npm run migrate

# Start server
node dist/index.js
```

---

**Reference**: See [README_AI.md](../README_AI.md) for architectural overview.
