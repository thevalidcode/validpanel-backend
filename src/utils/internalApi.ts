import axios, { Method } from "axios";
import { redis } from "../config/redis.config";

// Map store type to base URL
function getBaseUrl(
  storeType: "social-media-store" | "digital" | "shop"
): string {
  switch (storeType) {
    case "social-media-store":
      return "https://validpanel.com/social-media-store/backend";
    case "digital":
      return "https://validpanel.com/digital/backend";
    case "shop":
      return "https://validpanel.com/shop/backend";
    default:
      throw new Error("Invalid store type");
  }
}

// Build unique Redis key
function buildRedisKey(userKey: string, storeId: string) {
  return `internalAuth:${userKey}:${storeId}`;
}

async function getInternalAuthToken(
  userKey: string,
  email: string,
  password: string,
  storeType: "social-media-store" | "digital" | "shop",
  storeId: string
): Promise<string> {
  const redisKey = buildRedisKey(userKey, storeId);

  // 1. Try from Redis
  const cachedToken = await redis.get(redisKey);
  if (cachedToken) {
    return cachedToken;
  }

  // 2. Otherwise request a new one
  const baseUrl = getBaseUrl(storeType);
  const response = await axios.post(
    `${baseUrl}/user/me`,
    {
      email,
      password,
      storeId,
    },
    {
      headers: { Origin: "https://validpanel.com" },
    }
  );

  const token = response.headers["x-internal-auth"];
  if (!token) throw new Error("No internal auth token returned");

  // 3. Save with 14-min TTL
  await redis.set(redisKey, token, {
    expiration: { type: "EX", value: 14 * 60 },
  });

  return token;
}

export async function callInternalAPI(
  method: Method, // GET, POST, PUT, DELETE
  endpoint: string, // dynamic endpoint, e.g. "/user/me"
  userKey: string,
  email: string,
  password: string,
  storeType: "social-media-store" | "digital" | "shop",
  storeId: string,
  data?: any // optional body for POST/PUT
) {
  try {
    const token = await getInternalAuthToken(
      userKey,
      email,
      password,
      storeType,
      storeId
    );

    const baseUrl = getBaseUrl(storeType);
    const url = `${baseUrl}${endpoint}`;

    const response = await axios.request({
      url,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Origin: "https://validpanel.com",
      },
      data,
    });

    return response.data;
  } catch (err: any) {
    throw new Error(
      `Login failed: ${err.response?.data?.error || err.message}`
    );
  }
}
