# ValidPanel Core Platform - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ValidPanel Ecosystem                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐    ┌──────────────────────┐              │
│  │   validpanel         │    │  validpanel-backend  │              │
│  │  (React SPA)         │◄──►│  (Core Platform)     │              │
│  └──────────────────────┘    └──────────────────────┘              │
│                                       ▲                             │
│         User Registration              │ Subscriptions              │
│         Store Management               │ Payments                   │
│         Subscription UI                │ Coupons                    │
│                                       │ Users/Admins                │
│                                       ▼                             │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │  shop-backend        │  │ social-media-store-  │               │
│  │  (E-commerce)        │  │ backend (SMM)        │               │
│  └──────────────────────┘  └──────────────────────┘               │
│         ▲                           ▲                              │
│         │                           │                              │
│  ┌──────┴───────┐          ┌────────┴────────┐                    │
│  │              │          │                 │                    │
│  ▼              ▼          ▼                 ▼                    │
│  PostgreSQL   Stripe/   PostgreSQL   Stripe/                     │
│  (shop DB)    Paystack   (SMM DB)    Paystack                    │
│               /Flutter             /Flutter                      │
│               wave                 wave                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Multi-Tenancy Scoping Strategy

### ValidPanel Core Backend: User/Organization Level
```
User #1
├── Stores: [Shop A, SMM Store A, Shop B]
├── Subscriptions: [ACTIVE MONTHLY for Shop A]
└── Payments: [All payments for all stores]

User #2
├── Stores: [Shop C]
├── Subscriptions: [ACTIVE YEARLY for Shop C]
└── Payments: [All payments for Shop C]
```

### Shop Backend: Store Level (Delegated)
```
Store A (owned by User #1)
├── Products: [10 products]
├── Orders: [5 orders from customers]
└── Customers: [20 customers]

Store B (owned by User #1)
├── Products: [25 products]
├── Orders: [12 orders from customers]
└── Customers: [50 customers]
```

### Query Pattern
```typescript
// validpanel-backend: No shopId/storeId
const subscription = await prisma.subscription.findFirst({
  where: { userId: authUser.id, status: "ACTIVE" }
});

// shop-backend: shopId in every query
const products = await prisma.product.findMany({
  where: { shopId: request.auth.shopId }  // tenant isolation
});
```

## Billing Flow

### 1. New Subscription (First-time Purchase)

```
Step 1: User at Pricing Page
  → Frontend: useGetSubscriptionPlans() → Fetch ACTIVE plans
  → Display: [Plan A ($99/mo), Plan B ($199/mo), Plan C ($499/mo)]
  
Step 2: User selects Plan A + MONTHLY
  → Frontend: useCreateSubscription({
      planId: 1,
      billingCycle: "MONTHLY",
      currency: "NGN"
    })
  
Step 3: Backend: SubscriptionController.createSubscription()
  1. Validate: AuthSchema, Zod schema
  2. Create: Subscription (PENDING)
  3. Service: createSubscriptionPayment()
     - resolvePriceForSubscription(1, MONTHLY, NGN)
     - Get PlanPrice: { price: ₦49,500, amountInMinor: 4950000 }
     - Create: Payment (PENDING), Transaction (PENDING)
     - Initialize: Paystack/Flutterwave payment link
  4. Return: { status: "pending", paymentLink: "..." }
  
Step 4: Frontend: Redirect to Paystack
  → User enters card details
  → Payment processed
  
Step 5: Paystack Webhook
  → POST /payments/webhook { reference: "..." }
  → Backend: Verify signature
  → Backend: finalizeSubscriptionPayment({
      subscriptionId: 42,
      userId: 3,
      paymentId: 88,
      transactionId: 99,
      type: "SUBSCRIPTION_PAYMENT"
    })
  1. Mark: Payment → SUCCESS, Transaction → SUCCESS
  2. Update: Subscription → ACTIVE, expiresAt: (now + 1 month)
  3. Create: PaymentNotification
  4. Send: Confirmation email
  
Step 6: Frontend: Poll useGetUserActiveSubscription()
  → SUCCESS → Subscription visible
  → Store unlocked
```

### 2. Coupon-Applied Purchase

```
Step 1: User enters coupon code SAVE20 at checkout
  
Step 2: Frontend: useValidateCoupon("SAVE20")
  → POST /coupons/validate?code=SAVE20
  
Step 3: Backend: CouponController.validateCoupon()
  1. Fetch coupon: code="SAVE20", isActive=true
  2. Check: 
     - Not expired (startsAt ≤ now ≤ expiresAt)
     - Global usage < maxUses
     - User usage < perUserLimit
     - appliesTo includes "NEW"
     - currency matches (if FIXED)
     - rules allow this plan/interval/currency
  3. Return: {
       valid: true,
       discount: ₦7,425,  // 15% of ₦49,500
       finalAmount: ₦42,075
     }
  
Step 4: Frontend: Display final amount + apply
  → User clicks "Apply Coupon"
  
Step 5: Frontend: useCreateSubscription({
    planId: 1,
    couponCode: "SAVE20"  // Include coupon
  })
  
Step 6: Backend: createSubscriptionPayment()
  1. resolvePriceForSubscription() → ₦49,500
  2. applyCouponToAmount(tx, {
       couponCode: "SAVE20",
       amount: Decimal(49500),
       userId: 3,
       planId: 1
     })
     - Fetch coupon + validate again (transactional)
     - computeCouponDiscountAmount() → ₦7,425
     - Create: CouponRedemption (atomic with Payment)
  3. finalAmount = ₦42,075
  4. Create Payment + Transaction with final amount
  5. Atomically increment coupon.usedCount
  
Step 7: Payment → Webhook → finalizeSubscriptionPayment()
  → Subscription ACTIVE with finalAmount paid
```

### 3. Subscription Renewal

```
Step 1: CRON Job (daily) checks expiring subscriptions
  → Find: WHERE expiresAt ≤ now + 7 days AND status="ACTIVE"
  
Step 2: Send reminder email
  → "Your subscription expires in 7 days. Renew now."
  
Step 3: User clicks "Renew" → Frontend: useRenewSubscription()
  → ServiceSubscriptionController.renewSubscription()
  
Step 4: Backend: renewSubscription()
  1. Check: User has ACTIVE subscription
  2. Create: NEW Subscription (PENDING)
     - Same planId, billingCycle
     - expiresAt: not set yet (calculated on finalization)
  3. createSubscriptionPayment(type: "SUBSCRIPTION_RENEWAL")
  4. Return: payment link
  
Step 5: Payment → Webhook → finalizeSubscriptionPayment(type: "RENEWAL")
  1. Mark old subscription: EXPIRED
  2. Mark new subscription: ACTIVE, expiresAt: (now + 1 month)
  3. Send: Renewal confirmation
```

### 4. Subscription Upgrade

```
Step 1: User navigates to /subscription/upgrade
  → Frontend: useGetSubscriptionPlans()
  → Display: Available plans (filter current plan)
  
Step 2: User selects Plan C ($499/mo) from Plan A ($99/mo)
  → Frontend: useUpgradeSubscription({
      newPlanId: 3,
      billingCycle: "MONTHLY"
    })
  
Step 3: Backend: UpgradeController.upgrade()
  1. Fetch current ACTIVE subscription (Plan A)
  2. Calculate pro-rated amount:
     - Old: ₦49,500 for 30 days
     - New: ₦249,500 for 30 days
     - Days remaining: 10 days
     - Refund: ₦49,500 × (10/30) = ₦16,500
     - Charge: ₦249,500 × (20/30) = ₦166,333.33
     - Net: ₦166,333.33 - ₦16,500 = ₦149,833.33
  3. Create: Subscription (PENDING, newPlanId: 3)
  4. createSubscriptionPayment(type: "SUBSCRIPTION_UPGRADE")
  5. Return: { amount: ₦149,833.33, paymentLink: "..." }
  
Step 4: Payment → Webhook → finalizeSubscriptionPayment(type: "UPGRADE")
  1. Calculate new expiry: Keep old expiry (same cycle end)
  2. Mark old subscription: EXPIRED (with pro-rated end date)
  3. Mark new subscription: ACTIVE, planId: 3, expiresAt: old_expiresAt
  4. Create: Transaction (SUBSCRIPTION_UPGRADE)
  5. Send: Upgrade confirmation
```

## Coupon Rules System

### Coupon Model
```typescript
{
  uid: string,
  code: "SAVE20",
  type: "PERCENTAGE",  // or "FIXED"
  value: Decimal(20),   // 20% or ₦20
  currency: "NGN" | null,  // Required for FIXED, optional for PERCENTAGE
  
  // Usage Limits
  maxUses: 100,           // Global limit
  usedCount: 45,          // Global counter
  perUserLimit: 2,        // Max per user
  firstTimeOnly: true,    // Only NEW subscriptions
  
  // Validity
  appliesTo: ["NEW", "RENEWAL"],  // When applicable
  contexts: ["PRICING_PAGE", "EMAIL"],  // Where displayed
  startsAt: Date,         // Campaign start
  expiresAt: Date,        // Campaign end
  
  // Rules: Plan-specific restrictions
  rules: [
    { planId: 1, interval: "MONTHLY", currency: "NGN" },  // Only Plan 1 Monthly NGN
    { planId: null, interval: null, currency: "NGN" }  // Any plan, any interval, NGN only
  ],
  
  // Visibility
  isPublic: true,         // Show on pricing page
  isActive: true          // Can be redeemed
}
```

### Validation During Payment

```typescript
await applyCouponToAmount(tx, {
  couponCode: "SAVE20",
  amount: Decimal(49500),
  currency: "NGN",
  userId: 3,
  planId: 1,
  billingCycle: "MONTHLY",
  appliesTo: "NEW"  // Transaction type
});

// Checks:
// 1. Coupon exists + isActive
// 2. Now ≥ startsAt AND now ≤ expiresAt
// 3. usedCount < maxUses
// 4. User redemptions < perUserLimit
// 5. firstTimeOnly → user has no SUCCESS payments
// 6. appliesTo includes "NEW"
// 7. rules match (planId, interval, currency)
// If all pass: compute discount, return { coupon, discountAmount }
```

## Order Flow (from Store Perspective)

### Shop Backend Order Creation
```
1. User adds product to cart
2. User checks out
3. POST /orders
   - Backend: Verify ACTIVE subscription for store
   - Backend: Call validpanel-backend: GET /subscriptions/user/{id}/active
   - Response: { status: 200, subscription: { id, plan, expiresAt } }
   - If no ACTIVE: Return { status: 403, error: "No active subscription" }
   - If ACTIVE: Create order
4. Order created ✓
```

### Query Patterns
```typescript
// validpanel-backend: Subscription check
const subscription = await prisma.subscription.findFirst({
  where: { userId, status: "ACTIVE", expiresAt: { gt: new Date() } }
});
if (!subscription) throw new Error("No active subscription");

// shop-backend: Order creation (after subscription verified)
const order = await prisma.order.create({
  data: { shopId, customerId, totalAmount, items: [...] }
});
```

## Error Handling

### Payment Gateway Errors
```
Paystack Webhook:
  - Authorization failed → Return 401, retry later
  - Invalid reference → Return 404, log as suspicious
  - Already processed → Return 200 (idempotent)

Frontend:
  - Network error → Retry upto 3 times with exponential backoff
  - Validation error → Display field errors from Zod
  - Business error → Display normalized message ("Invalid coupon")
```

### Database Constraints
```
- Subscription.userId + status: ACTIVE → Unique index (only 1 ACTIVE per user)
- Coupon.code → Unique (case-insensitive)
- CouponRedemption → FK constraints (coupon must exist)
- Payment.externalId → Unique per gateway type
```

## Key Takeaways

1. **Pricing Resolution** is the single source of truth for all prices
2. **Coupon Application** is atomic with Payment creation (transactional)
3. **Finalization** is idempotent (safe for webhook retries)
4. **Multi-Tenancy** scoping differs from shop/SMM (user level, not store level)
5. **Webhook Handlers** must verify signature and check idempotency
6. **Subscription States** follow strict lifecycle (PENDING → ACTIVE → EXPIRED)

---

**Reference**: See [README_AI.md](./README_AI.md) and [.github/copilot-instructions.md](./.github/copilot-instructions.md) for implementation details.
