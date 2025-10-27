import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";
import { Context } from "hono";
import { UAParser } from "ua-parser-js";

export const sql = neon(process.env.DATABASE_URL!);

export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export const getLinkFromCache = async (shortcode: string) => {
  try {
    const cachedUrl = await redis.get(shortcode);
    return cachedUrl || null;
  } catch (error) {
    console.error("Error fetching from Redis:", error);
    return null;
  }
};

export const getLinkFromDatabase = async (shortcode: string) => {
  try {
    const result =
      await sql`SELECT * FROM links WHERE short_code = ${shortcode} LIMIT 1`;
    return result[0] || null;
  } catch (error) {
    throw error;
  }
};

export const recordLinkClick = async (shortcode: string) => {
  try {
    await sql`UPDATE links SET clicks = clicks + 1 WHERE short_code = ${shortcode}`;
  } catch (error) {
    console.error(error);
  }
};

export const cacheLinkRecord = async (
  shortcode: string,
  linkRecord: Record<string, any>,
) => {
  try {
    await redis.set(
      shortcode,
      {
        url: linkRecord.url,
        shortcode: linkRecord.short_code,
        password: linkRecord.password,
        archived: !!linkRecord.archived,
        expires_at: linkRecord.expires_at,
      },
      { ex: 60 * 60 * 24 },
    );
  } catch (error) {
    console.error(error);
  }
};

export const recordLinkAnalytics = async (c: Context, shortcode: string) => {
  const ua = c.req.header("user-agent");
  const ip = c.req.header("cf-connecting-ip");
  const referer = c.req.header("referer");
  const country = c.req.raw.cf?.country;
  const city = c.req.raw.cf?.region;

  const parser = new UAParser(ua);

  let deviceType = "unknown";

  const device = parser.getDevice();

  if (device.type) {
    deviceType = device.type;
  } else {
    const os = parser.getOS();
    if (os.name === "Windows" || os.name === "Mac OS" || os.name === "Linux") {
      deviceType = "desktop";
    }
  }

  try {
    await sql`
      INSERT INTO clicks
        (short_code, user_agent, ip, referer, country_code, city, device_type)
      VALUES
        (${shortcode}, ${ua}, ${ip}, ${referer}, ${country}, ${city}, ${deviceType})`;
  } catch (error) {
    console.error("Error recording link analytics:", error);
  }
};
