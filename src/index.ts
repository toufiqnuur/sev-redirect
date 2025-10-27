import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import {
  cacheLinkRecord,
  getLinkFromCache,
  getLinkFromDatabase,
  recordLinkAnalytics,
  recordLinkClick,
} from "./db";
import {
  ArchivedView,
  ExpiredView,
  NotFoundView,
  ProtectedView,
} from "./views";
import { AppLayout } from "./views/layout";

declare module "hono" {
  interface ContextRenderer {
    (content: string | Promise<string>, props: { title: string }): Response;
  }
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("*", jsxRenderer(AppLayout));

app.get("/", (c) => {
  return c.redirect(c.env.FRONTEND_URL, 302);
});

app.get("/:shortcode", async (c) => {
  const { shortcode } = c.req.param();
  let linkRecord: Record<string, any> | null = null;
  let isCacheMiss = false;

  linkRecord = await getLinkFromCache(shortcode);

  if (!linkRecord) {
    isCacheMiss = true;
    linkRecord = await getLinkFromDatabase(shortcode);
  }

  if (!linkRecord) {
    return c.notFound();
  }

  c.executionCtx.waitUntil(
    (async () => {
      const tasks = [];

      tasks.push(recordLinkClick(shortcode));
      tasks.push(recordLinkAnalytics(c, shortcode));
      if (isCacheMiss) tasks.push(cacheLinkRecord(shortcode, linkRecord));

      await Promise.allSettled(tasks);
    })(),
  );

  if (linkRecord.archived) {
    c.status(410);
    return c.render(ArchivedView(c), { title: "Link Archived" });
  }

  if (linkRecord.expires_at && new Date(linkRecord.expires_at) < new Date()) {
    c.status(410);
    return c.render(ExpiredView(c), { title: "Link Expired" });
  }

  if (linkRecord.password) {
    c.status(401);
    return c.render(ProtectedView(c), { title: "Protected Link" });
  }

  return c.redirect(linkRecord.url, 302);
});

app.post("/:shortcode", async (c) => {
  const { shortcode } = c.req.param();
  const body = await c.req.formData();
  const password = body.get("password");
  let linkRecord: Record<string, any> | null = null;
  let isCacheMiss = false;

  linkRecord = await getLinkFromCache(shortcode);

  if (!linkRecord) {
    isCacheMiss = true;
    linkRecord = await getLinkFromDatabase(shortcode);
  }

  if (!linkRecord) {
    return c.notFound();
  }

  const isPasswordValid = password === linkRecord.password;

  if (!isPasswordValid) {
    c.status(401);
    return c.render(ProtectedView(c, "Kata sandi tidak valid"), {
      title: "Protected Link",
    });
  }

  return c.redirect(linkRecord.url, 302);
});

app.notFound((c) => {
  c.status(404);
  return c.render(NotFoundView(c), { title: "Not Found" });
});

export default app;
