"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { registerOrganizer } from "@/lib/auth/auth";
import { ArrowLeft, Mail, Lock, User, CheckCircle2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

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
      const res = await registerOrganizer({
        name,
        email,
        password,
      });

      if (res.success) {
        setRegisteredEmail(res.email || email);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while creating your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 max-w-sm mx-auto space-y-5 animate-in fade-in">
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

        {registeredEmail ? (
          <div className="space-y-4 text-left animate-in zoom-in-95">
            <div className="p-3.5 rounded-2xl bg-eucalyptus-festival/15 border border-eucalyptus-festival/30 text-eucalyptus-dark space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-eucalyptus-festival/20 flex items-center justify-center mx-auto text-teal-festival">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-teal-festival">
                Activation Email Sent!
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                We have sent a verification email to:
              </p>
              <strong className="block text-sm text-teal-festival font-mono break-all">
                {registeredEmail}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-parchment-100 border border-parchment-200 text-xs text-ink-muted space-y-2">
              <p className="font-semibold text-ink-festival flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-terracotta-festival shrink-0" />
                <span>Account Activation Required</span>
              </p>
              <p>
                In order to access the festival organizer dashboard, you must first confirm your email address by clicking the activation link.
              </p>
              <p className="text-[11px] text-parchment-400 italic">
                (Look at the Simulated Mailbox notification at the top of your screen or check your inbox to click the activation link.)
              </p>
            </div>

            <Link
              href="/admin"
              className="block w-full py-2.5 px-4 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light text-center transition-colors shadow-sm"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h2 className="font-serif font-bold text-xl text-teal-festival">
                Register Organizer
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                Create a festival staff account to update schedules, post notices, and manage checkpoints.
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
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Marie van der Merwe"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-xs text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                  Email Address
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

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                  Password
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
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
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
                  {loading ? "Creating Account..." : "Create Account & Send Verification"}
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-ink-muted">
                Already have an account?{" "}
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
