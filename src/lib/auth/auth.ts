import { OrganizerUser, AuthSession } from '@/lib/types';
import { sendActivationEmail, sendPasswordResetEmail } from './mailer';

const USERS_STORAGE_KEY = 'klik_organizer_users';
const SESSION_STORAGE_KEY = 'klik_auth_session';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '::klik2026_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getStoredUsers(): OrganizerUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredUsers(users: OrganizerUser[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save organizer users:', err);
  }
}

export async function initDefaultAdmin(): Promise<void> {
  if (typeof window === 'undefined') return;
  const users = getStoredUsers();
  const adminExists = users.some((u) => u.email.toLowerCase() === 'admin@klik2026.co.za');
  if (!adminExists) {
    const defaultHash = await hashPassword('Klik2026!');
    const seedAdmin: OrganizerUser = {
      id: 'usr_lead_organizer_seed',
      email: 'admin@klik2026.co.za',
      name: 'Festival Lead Organizer',
      passwordHash: defaultHash,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: undefined,
    };
    users.unshift(seedAdmin);
    saveStoredUsers(users);
    console.log('[KliK Auth] Seed admin initialized: admin@klik2026.co.za (Klik2026!)');
  }
}

export async function registerOrganizer({
  email,
  name,
  password,
  baseUrl,
}: {
  email: string;
  name: string;
  password: string;
  baseUrl?: string;
}): Promise<{ success: boolean; message: string; email?: string }> {
  await initDefaultAdmin();
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    if (!existing.isEmailVerified) {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      existing.verificationToken = token;
      existing.verificationTokenExpiresAt = expiresAt;
      saveStoredUsers(users);
      await sendActivationEmail(existing.email, existing.name, token, baseUrl);
      return {
        success: true,
        email: existing.email,
        message: 'Account exists but was not activated yet. We have re-sent your activation email!',
      };
    }
    return {
      success: false,
      message: 'An account with this email address already exists. Please sign in or reset your password.',
    };
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = crypto.randomUUID();
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

  const newUser: OrganizerUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    email: normalizedEmail,
    name: name.trim(),
    passwordHash,
    isEmailVerified: false,
    verificationToken,
    verificationTokenExpiresAt,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveStoredUsers(users);

  await sendActivationEmail(newUser.email, newUser.name, verificationToken, baseUrl);

  return {
    success: true,
    email: newUser.email,
    message: 'Registration successful! A confirmation email has been dispatched. Please click the link in your email to activate your account.',
  };
}

export async function verifyOrganizerEmail(token: string): Promise<{
  success: boolean;
  message: string;
  email?: string;
}> {
  if (!token) {
    return { success: false, message: 'Invalid or missing activation token.' };
  }

  const users = getStoredUsers();
  const userIndex = users.findIndex((u) => u.verificationToken === token);

  if (userIndex === -1) {
    return {
      success: false,
      message: 'Activation link is invalid or has already been used.',
    };
  }

  const user = users[userIndex];
  if (user.verificationTokenExpiresAt && new Date(user.verificationTokenExpiresAt).getTime() < Date.now()) {
    return {
      success: false,
      message: 'This activation link has expired. Please register again or request a new activation link.',
    };
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  saveStoredUsers(users);

  return {
    success: true,
    email: user.email,
    message: 'Your account has been successfully verified and activated! You may now sign in.',
  };
}

export async function resendActivation(
  email: string,
  baseUrl?: string
): Promise<{ success: boolean; message: string }> {
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return { success: false, message: 'No account found with this email address.' };
  }

  if (user.isEmailVerified) {
    return { success: false, message: 'Your account is already activated. Please sign in.' };
  }

  const token = crypto.randomUUID();
  user.verificationToken = token;
  user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  saveStoredUsers(users);

  await sendActivationEmail(user.email, user.name, token, baseUrl);

  return {
    success: true,
    message: 'A fresh activation email has been sent to ' + user.email + '.',
  };
}

export async function requestPasswordReset(
  email: string,
  baseUrl?: string
): Promise<{ success: boolean; message: string }> {
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return {
      success: true,
      message: 'If that email address is registered, instructions to reset your password have been sent.',
    };
  }

  const resetToken = crypto.randomUUID();
  const resetExpires = new Date(Date.now() + 3600 * 1000).toISOString();

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = resetExpires;
  saveStoredUsers(users);

  await sendPasswordResetEmail(user.email, user.name, resetToken, baseUrl);

  return {
    success: true,
    message: 'Password reset instructions have been sent to your email address.',
  };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  if (!token) {
    return { success: false, message: 'Missing password reset token.' };
  }

  if (newPassword.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const users = getStoredUsers();
  const user = users.find((u) => u.resetPasswordToken === token);

  if (!user) {
    return {
      success: false,
      message: 'Invalid or already used password reset link. Please request a new one.',
    };
  }

  if (user.resetPasswordExpiresAt && new Date(user.resetPasswordExpiresAt).getTime() < Date.now()) {
    return {
      success: false,
      message: 'This password reset link has expired. Please request a new reset link.',
    };
  }

  user.passwordHash = await hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  user.isEmailVerified = true;
  saveStoredUsers(users);

  return {
    success: true,
    message: 'Password successfully updated! You can now sign in with your new password.',
  };
}

export async function loginOrganizer(
  email: string,
  password: string
): Promise<{
  success: boolean;
  message?: string;
  error?: 'invalid_credentials' | 'unverified';
  user?: { id: string; email: string; name: string };
}> {
  await initDefaultAdmin();
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return {
      success: false,
      error: 'invalid_credentials',
      message: 'Invalid email or password.',
    };
  }

  const hash = await hashPassword(password);
  if (user.passwordHash !== hash) {
    return {
      success: false,
      error: 'invalid_credentials',
      message: 'Invalid email or password.',
    };
  }

  if (!user.isEmailVerified) {
    return {
      success: false,
      error: 'unverified',
      message: 'Your account is not active. Please click the confirmation link sent to your email in order to activate your account before logging in.',
    };
  }

  const session: AuthSession = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  };

  user.lastLoginAt = new Date().toISOString();
  saveStoredUsers(users);

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  return {
    success: true,
    user: session.user,
  };
}

export function getCurrentSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function logoutOrganizer(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
