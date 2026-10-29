import "server-only";
import { headers } from "next/headers";

// Tells the team about new customer requests. Best effort: a failed notification
// is logged and never affects the customer's submission. Channels switch on when
// their settings exist in .env.local (see .env.example):
//
//   LINE  — LINE Messaging API push to a user or group (LINE Notify has shut down)
//           LINE_CHANNEL_ACCESS_TOKEN, LINE_NOTIFY_TO
//   Email — Resend (resend.com)
//           RESEND_API_KEY, NOTIFY_EMAIL_TO (comma-separated), NOTIFY_EMAIL_FROM
//
// With neither configured, staff still see the red badge on /staff/quotes.

export type StaffNotice = { title: string; lines: string[]; link?: string };
export type NotifyResult = { line: "sent" | "failed" | "off"; email: "sent" | "failed" | "off" };

const LINE_API = process.env.LINE_API_URL || "https://api.line.me";
const RESEND_API = process.env.RESEND_API_URL || "https://api.resend.com";

/** Absolute site URL for links in messages: SITE_URL, else the current request's host. */
export async function siteUrl(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function notifyStaff(notice: StaffNotice): Promise<NotifyResult> {
  const text = [notice.title, ...notice.lines, ...(notice.link ? [notice.link] : [])].join("\n");
  const [line, email] = await Promise.all([sendLine(text), sendEmail(notice, text)]);
  if (line === "off" && email === "off") console.info("[notify] no channel configured:", notice.title);
  return { line, email };
}

async function sendLine(text: string): Promise<NotifyResult["line"]> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_NOTIFY_TO;
  if (!token || !to) return "off";
  try {
    const res = await fetch(`${LINE_API}/v2/bot/message/push`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ to, messages: [{ type: "text", text: text.slice(0, 4900) }] }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return "sent";
  } catch (e) {
    console.error("[notify] LINE failed:", e);
    return "failed";
  }
}

async function sendEmail(notice: StaffNotice, text: string): Promise<NotifyResult["email"]> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO?.split(",").map((s) => s.trim()).filter(Boolean);
  if (!key || !to?.length) return "off";
  try {
    const res = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: process.env.NOTIFY_EMAIL_FROM || "Fitness Equipment Asia <onboarding@resend.dev>",
        to,
        subject: notice.title,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return "sent";
  } catch (e) {
    console.error("[notify] email failed:", e);
    return "failed";
  }
}
