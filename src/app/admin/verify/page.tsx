"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { verifyOrganizerEmail } from "@/lib/auth/auth";
import { CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const doVerify = async () => {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage("No activation token was provided in this link.");
        return;
      }

      try {
        const res = await verifyOrganizerEmail(token);
        setSuccess(res.success);
        setMessage(res.message);
        if (res.email) setEmail(res.email);
      } catch (err: any) {
        setSuccess(false);
        setMessage(err?.message || "Failed to verify activation token.");
      } finally {
        setLoading(false);
      }
    };

    doVerify();
  }, [token]);

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

        {loading ? (
          <div className="py-8 space-y-3 text-ink-muted">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-festival" />
            <p className="text-xs font-medium">Verifying your account activation token...</p>
          </div>
        ) : success ? (
          <div className="space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-eucalyptus-festival/20 text-eucalyptus-dark flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-teal-festival" />
            </div>

            <div>
              <h2 className="font-serif font-bold text-xl text-teal-festival">
                Account Activated!
              </h2>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                {message}
              </p>
              {email && (
                <div className="mt-2 text-xs font-mono font-bold text-teal-festival bg-parchment-100 py-1.5 px-3 rounded-lg inline-block border border-parchment-200">
                  {email}
                </div>
              )}
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light transition-colors shadow-sm"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-serif font-bold text-xl text-red-700">
                Activation Failed
              </h2>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                {message}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/admin/register"
                className="w-full py-2.5 px-4 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light transition-colors text-center shadow-sm"
              >
                Register Again
              </Link>
              <Link
                href="/admin"
                className="w-full py-2.5 px-4 rounded-xl bg-parchment-200 text-ink-festival text-xs font-bold hover:bg-parchment-300 transition-colors text-center"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-xs text-ink-muted">
          Loading verification...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
