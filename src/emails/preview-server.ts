/*
 Simple email preview server.
 Run with: `npx ts-node src/emails/preview-server.ts`
 It serves simple pages to preview templates in the browser.
*/

import http from "http";
import {
  adminNewUser,
  adminNewStore,
  adminStoreApprovalRequired,
} from "./templates/admin-notification.templates";
import {
  adminManualPaymentPending,
  adminPaymentReceived,
} from "./templates/admin-payments.templates";
import {
  adminNewSubscription,
  adminSubscriptionsExpiring,
} from "./templates/admin-subscriptions.templates";
import {
  adminDailySummary,
  adminContactMessage,
} from "./templates/admin-daily-contact.templates";
import { welcomeUser } from "./templates/user.templates";

const port = process.env.PORT ? Number(process.env.PORT) : 3005;

const templates: { [k: string]: { title: string; render: () => string } } = {
  "admin/new-user": {
    title: "Admin - New User",
    render: () =>
      adminNewUser({
        userName: "Jane Doe",
        userEmail: "jane@example.com",
        registeredAt: new Date().toLocaleString(),
        logo: "https://validpanel.com/logo.png",
      }).html,
  },
  "admin/new-store": {
    title: "Admin - New Store",
    render: () =>
      adminNewStore({
        storeName: "My Store",
        storeId: "store_123",
        ownerName: "Jane Doe",
        ownerEmail: "jane@example.com",
        createdAt: new Date().toLocaleString(),
        logo: "https://validpanel.com/logo.png",
      }).html,
  },
  "admin/store-approval": {
    title: "Admin - Store Approval",
    render: () =>
      adminStoreApprovalRequired({
        storeName: "My Store",
        storeId: "store_123",
        ownerName: "Jane Doe",
        ownerEmail: "jane@example.com",
        description: "Store sells widgets",
        createdAt: new Date().toLocaleString(),
        logo: "https://validpanel.com/logo.png",
      }).html,
  },
  "admin/payment-pending": {
    title: "Admin - Payment Pending",
    render: () =>
      adminManualPaymentPending({
        storeName: "My Store",
        storeId: "store_123",
        ownerName: "Jane Doe",
        ownerEmail: "jane@example.com",
        amount: "49.99",
        currency: "$",
        planName: "Pro",
        paymentReference: "REF12345",
        submittedAt: new Date().toLocaleString(),
        logo: "https://validpanel.com/logo.png",
      }).html,
  },
  "admin/payment-received": {
    title: "Admin - Payment Received",
    render: () =>
      adminPaymentReceived({
        storeName: "My Store",
        storeId: "store_123",
        ownerName: "Jane Doe",
        ownerEmail: "jane@example.com",
        amount: "49.99",
        currency: "$",
        planName: "Pro",
        transactionId: "TXN12345",
        paymentMethod: "Stripe",
        receivedAt: new Date().toLocaleString(),
        logo: "https://validpanel.com/logo.png",
      }).html,
  },
  "admin/new-subscription": {
    title: "Admin - New Subscription",
    render: () =>
      adminNewSubscription({
        storeName: "My Store",
        storeId: "store_123",
        planName: "Pro",
        amount: "49.99",
        currency: "$",
        ownerName: "Jane Doe",
        ownerEmail: "jane@example.com",
        subscribedAt: new Date().toLocaleString(),
        logo: "https://validpanel.com/logo.png",
      }).html,
  },
  "admin/subscriptions-expiring": {
    title: "Admin - Subscriptions Expiring",
    render: () =>
      adminSubscriptionsExpiring({
        expiringCount: 2,
        stores: [
          {
            storeName: "A",
            storeId: "a",
            ownerEmail: "a@example.com",
            planName: "Pro",
            expiresAt: new Date().toLocaleDateString(),
          },
          {
            storeName: "B",
            storeId: "b",
            ownerEmail: "b@example.com",
            planName: "Basic",
            expiresAt: new Date().toLocaleDateString(),
          },
        ],
        logo: "https://validpanel.com/logo.png",
      }).html,
  },
  "admin/daily-summary": {
    title: "Admin - Daily Summary",
    render: () =>
      adminDailySummary({
        date: new Date().toLocaleDateString(),
        newUsers: 5,
        newStores: 3,
        newSubscriptions: 4,
        totalRevenue: "349.99",
        currency: "$",
        pendingApprovals: 1,
        pendingPayments: 0,
        logo: "https://validpanel.com/logo.png",
      }).html,
  },
  "admin/contact-message": {
    title: "Admin - Contact Message",
    render: () =>
      adminContactMessage({
        senderName: "Alice",
        senderEmail: "alice@example.com",
        subject: "Help needed",
        message: "Hello, I need help with X",
        ticketId: "TCKT123",
        receivedAt: new Date().toLocaleString(),
        logo: "https://validpanel.com/logo.png",
      }).html,
  },
  "user/welcome": {
    title: "User - Welcome",
    render: () =>
      welcomeUser({
        firstName: "Jane Doe",
        email: "jane@example.com",
        logo: "https://validpanel.com/logo.png",
      }).html,
  },
};

const indexHtml = () => {
  const links = Object.keys(templates)
    .map((k) => `<li><a href="/${k}">${templates[k].title}</a></li>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Email previews</title></head><body><h1>Email previews</h1><ul>${links}</ul></body></html>`;
};

const server = http.createServer((req, res) => {
  if (!req.url) return;
  const path = req.url.replace(/^\//, "");
  if (path === "" || path === "index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(indexHtml());
    return;
  }
  const tpl = templates[path];
  if (!tpl) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found. See / for available previews.");
    return;
  }

  // Each template might return a string or an object (TemplateResult).
  const result = tpl.render();
  let html: string;
  if (typeof result === "string") html = result;
  else if (result && typeof (result as any).html === "string")
    html = (result as any).html;
  else if (result && typeof (result as any).children === "string")
    html = (result as any).children;
  else html = String(result);
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Email preview server running: http://localhost:${port}`);
});
