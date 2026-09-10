import { SentEmail } from "@/lib/types";

const MAILBOX_KEY = "klik_simulated_mailbox";

export function getSentEmails(): SentEmail[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MAILBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSentEmail(email: SentEmail) {
  if (typeof window === "undefined") return;
  try {
    const existing = getSentEmails();
    const updated = [email, ...existing].slice(0, 30);
    localStorage.setItem(MAILBOX_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("klik_email_sent", {
        detail: email,
      })
    );
    console.log("[KliK Mailer] Email dispatched to " + email.to + ": " + email.subject);
    console.log("[KliK Mailer] Action URL: " + email.actionUrl);
  } catch (err) {
    console.error("Failed to store simulated email:", err);
  }
}

export function clearSentEmails() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MAILBOX_KEY);
}

export async function sendActivationEmail(
  toEmail: string,
  userName: string,
  token: string,
  origin?: string
): Promise<SentEmail> {
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const actionUrl = base + "/admin/verify?token=" + encodeURIComponent(token);

  const email: SentEmail = {
    id: "mail_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    to: toEmail,
    subject: "Activate your KliK 2026 Organizer Account",
    body:
      "Hello " +
      userName +
      ",\n\nThank you for registering as a festival organizer for KliK 2026 (Kleinmondfees).\n\nTo activate your account and access the organizer dashboard, please click the link below:\n\n" +
      actionUrl +
      "\n\nIf you did not request this account, you can safely ignore this email.\n\nWarm regards,\nThe KliK 2026 Festival Team",
    actionUrl,
    actionText: "Activate Account",
    type: "activation",
    sentAt: new Date().toISOString(),
  };

  saveSentEmail(email);
  return email;
}

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  token: string,
  origin?: string
): Promise<SentEmail> {
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const actionUrl = base + "/admin/reset-password?token=" + encodeURIComponent(token);

  const email: SentEmail = {
    id: "mail_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    to: toEmail,
    subject: "Reset your KliK 2026 Organizer Password",
    body:
      "Hello " +
      userName +
      ",\n\nWe received a request to reset your password for your KliK 2026 organizer account.\n\nPlease click the button or link below to set a new password:\n\n" +
      actionUrl +
      "\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, you can safely disregard this email.\n\nWarm regards,\nThe KliK 2026 Festival Team",
    actionUrl,
    actionText: "Reset Password",
    type: "password_reset",
    sentAt: new Date().toISOString(),
  };

  saveSentEmail(email);
  return email;
}
