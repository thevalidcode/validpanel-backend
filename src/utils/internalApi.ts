import axios, { Method } from "axios";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config"; // zod-validated env loader
import { redis } from "../config/redis.config";
import { prisma } from "../config/db.config";
import { StoreType } from "../../prisma/generated";

/* ---------------------- HELPERS ---------------------- */

// Map store type to base URL
function getBaseUrl(storeType: StoreType): string {
  switch (storeType) {
    case "SOCIAL":
      return env.SOCIAL_MEDIA_STORE_BACKEND_URL;
    case "DIGITAL":
      return env.DIGITAL_BACKEND_URL;
    case "SHOP":
      return env.SHOP_BACKEND_URL;
    default:
      throw new Error("Invalid store type");
  }
}

// Build unique Redis key for caching tokens
function buildRedisKey(parts: (string | number)[]): string {
  return `internalAuth:${parts.join(":")}`;
}

// Generate a signed internal JWT
function generateInternalJWT(payload: object): string {
  return jwt.sign(payload, env.INTERNAL_SERVICE_USER_JWT_SECRET, {
    expiresIn: "15m",
  });
}

function generateInternalAdminJWT(payload: object): string {
  return jwt.sign(payload, env.INTERNAL_SERVICE_ADMIN_JWT_SECRET, {
    expiresIn: "15m",
  });
}

/* ---------------------- TOKEN MANAGER ---------------------- */

// For user-scoped calls (uid + storeId required)
async function getUserScopedToken(
  uid: string,
  storeId: number,
  storeType: StoreType,
): Promise<string> {
  const redisKey = buildRedisKey([uid, storeId]);

  // 1. Check Redis
  const cachedToken = await redis.get(redisKey);
  if (cachedToken) return cachedToken;

  // 2. Create new token
  const token = generateInternalJWT({
    uid,
    storeId,
    aud:
      storeType === "SOCIAL"
        ? "social-media-store"
        : storeType === "SHOP"
          ? "shop"
          : "digital",
    iss: "core",
  });

  // 3. Cache for 14 mins
  await redis.set(redisKey, token, "EX", 14 * 60);

  return token;
}

// For admin/global calls (no uid/storeId)
async function getAdminScopedToken(
  uid: string,
  storeType: StoreType,
): Promise<string> {
  const redisKey = buildRedisKey([uid, storeType]);

  // 1. Check Redis
  const cachedToken = await redis.get(redisKey);
  if (cachedToken) return cachedToken;

  // 2. Create new token
  const token = generateInternalAdminJWT({
    uid,
    aud:
      storeType === "SOCIAL"
        ? "social-media-store"
        : storeType === "SHOP"
          ? "shop"
          : "digital",
    iss: "core",
  });

  // 3. Cache for 14 mins
  await redis.set(redisKey, token, "EX", 14 * 60);
  return token;
}

/* ---------------------- MAIN CALL FUNCTIONS ---------------------- */

/**
 * Internal API call for user-scoped requests
 * Example: A user’s orders, balance, or transactions inside a specific store.
 */
export async function callInternalAPIForUsers<T = any>(
  method: Method, // GET, POST, PUT, DELETE
  endpoint: string, // e.g. "/orders"
  uid: string, // user ID
  storeId: number, // store ID
  data?: any, // optional POST/PUT body
): Promise<{ storeType: StoreType; data: T }> {
  try {
    // Validate store
    const store = await prisma.store.findUnique({ where: { storeId } });
    if (!store) throw new Error("Store not found");

    // Get token
    const token = await getUserScopedToken(uid, storeId, store.type);

    // Build request
    const baseUrl = getBaseUrl(store.type);
    const url = `${baseUrl}${endpoint}`;

    const response = await axios.request<T>({
      url,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data,
    });

    return { storeType: store.type, data: response.data };
  } catch (err: any) {
    throw new Error(`${err.response?.data?.error.message || err.message}`);
  }
}

/**
 * Internal API call for admin/global requests
 * Example: Fetching all stores, analytics across the system, etc.
 */
export async function callInternalAPIForAdmins<T = any>(
  method: Method,
  endpoint: string, // e.g. "/orders"
  uid: string, // e.g. Admin's Uid
  storeType: StoreType, // which service backend to hit
  data?: any,
): Promise<T> {
  try {
    // Get admin-scoped token
    const token = await getAdminScopedToken(uid, storeType);

    // Build request
    const baseUrl = getBaseUrl(storeType);
    const url = `${baseUrl}${endpoint}`;

    const response = await axios.request<T>({
      url,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data,
    });

    return response.data;
  } catch (err: any) {
    throw new Error(`${err.response?.data?.error.message || err.message}`);
  }
}
