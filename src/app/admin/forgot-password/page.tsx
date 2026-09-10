"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { requestPasswordReset } from "@/lib/auth/auth";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to process password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-sm mx-auto space-y-5 animate-in fade-in">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-festival hover:text-teal-light"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Organizer Sign In</span>
      </Link>

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

        {submitted ? (
          <div className="space-y-4 text-left animate-in zoom-in-95">
            <div className="p-4 rounded-2xl bg-eucalyptus-festival/15 border border-eucalyptus-festival/30 text-eucalyptus-dark space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-eucalyptus-festival/20 flex items-center justify-center mx-auto text-teal-festival">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-teal-festival">
                Reset Instructions Dispatched
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                If an account exists for <strong className="text-ink-festival">{email}</strong>, a password reset link has been sent to your email.
              </p>
            </div>

            <p className="text-[11px] text-ink-muted text-center italic">
              (Check the Simulated Mailbox banner at the top of your screen or your email inbox to click your reset link.)
            </p>

            <Link
              href="/admin"
              className="block w-full py-2.5 px-4 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light text-center transition-colors shadow-sm"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h2 className="font-serif font-bold text-xl text-teal-festival">
                Forgot Password
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                Enter the email address registered with your organizer account to receive a reset link.
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
                  Organizer Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="organizer@klik2026.co.za"
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
                  {loading ? "Sending Reset Link..." : "Send Password Reset Link"}
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-ink-muted">
                Remember your password?{" "}
                <Link href="/admin" className="font-bold text-teal-festival hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
