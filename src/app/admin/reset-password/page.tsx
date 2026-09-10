"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { resetPasswordWithToken } from "@/lib/auth/auth";
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("No reset token provided. Please use the link sent to your email.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithToken(token, password);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-sm mx-auto space-y-5 animate-in fade-in">
      <div className="bg-parchment-50 p-6 sm:p-8 rounded-3xl border border-parchment-300 shadow-card text-center space-y-4">
        <div className="w-14 h-14 mx-auto mb-1">
          <Image
            src="/assets/klik-round-logo-128.png"
            alt="KliK Logo"
            width={56}
            height={56}
            className="w-full h-full object-contain"
          />
        </div>

        {success ? (
          <div className="space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-eucalyptus-festival/20 text-eucalyptus-dark flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-teal-festival" />
            </div>

            <div>
              <h2 className="font-serif font-bold text-xl text-teal-festival">
                Password Reset!
              </h2>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Your password has been successfully updated. You can now sign in with your new credentials.
              </p>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light transition-colors shadow-sm"
            >
              <span>Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h2 className="font-serif font-bold text-xl text-teal-festival">
                Set New Password
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                Enter your new secure password for your organizer account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 text-left">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-xs text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-xs text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-xs text-ink-muted">
          Loading reset form...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
