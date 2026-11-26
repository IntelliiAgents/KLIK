"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { repository } from "@/lib/db/repository";
import {
  loginOrganizer,
  getCurrentSession,
  logoutOrganizer,
  resendActivation,
  initDefaultAdmin,
} from "@/lib/auth/auth";
import {
  FestivalEvent,
  VenueLocation,
  FestivalNotice,
  Challenge,
  AuthSession,
  ManualCheckInAuditEntry,
  CheckInVerificationMethod,
} from "@/lib/types";
import { FESTIVAL_CONFIG, QUEST_CONFIG, QUEST_SPONSORS } from "@/lib/config";
import {
  getAnalyticsSummary,
  type PrivacyAnalyticsSummary,
} from "@/lib/analytics";
import {
  Shield,
  Lock,
  Mail,
  Calendar,
  MapPin,
  Bell,
  Award,
  AlertTriangle,
  AlertCircle,
  Check,
  Plus,
  ArrowLeft,
  Clock,
  UserCheck,
  LogOut,
  RefreshCw,
  QrCode,
  Printer,
  Download,
  Eye,
  ExternalLink,
  Copy,
  XCircle,
  BarChart3,
  MessageCircle,
  Search,
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);

  // Email / Password login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"events" | "venues" | "notices" | "quest">("events");
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [notices, setNotices] = useState<FestivalNotice[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [posterVenue, setPosterVenue] = useState<VenueLocation | null>(null);

  // New Notice form state
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeLevel, setNoticeLevel] = useState<"info" | "important" | "urgent">("important");
  const [noticeSuccess, setNoticeSuccess] = useState(false);

  // Manual Check-In Approval & Audit Trail state (authenticated organizers only)
  const [manualParticipantId, setManualParticipantId] = useState("");
  const [manualParticipantName, setManualParticipantName] = useState("");
  const [manualVenueId, setManualVenueId] = useState("loc-the-shed");
  const [manualMethod, setManualMethod] =
    useState<CheckInVerificationMethod>("manual_whatsapp_selfie");
  const [manualNotes, setManualNotes] = useState("");
  const [manualFeedback, setManualFeedback] = useState<{
    type: "success" | "error";
    text: string;
    approvalLink?: string;
  } | null>(null);
  const [auditTrail, setAuditTrail] = useState<ManualCheckInAuditEntry[]>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [analyticsSummary, setAnalyticsSummary] =
    useState<PrivacyAnalyticsSummary | null>(null);

  // Initialize and check existing session
  useEffect(() => {
    const init = async () => {
      await initDefaultAdmin();
      const session = getCurrentSession();
      if (session) {
        setAuthSession(session);
        setIsAuthenticated(true);
      }
    };
    init();
  }, []);

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const [evts, vns, notifs, ch, trail] = await Promise.all([
          repository.getEvents(),
          repository.getVenues(),
          repository.getNotices(),
          repository.getChallenge(),
          repository.getManualCheckInAuditTrail(),
        ]);
        setEvents(evts);
        setVenues(vns);
        setNotices(notifs);
        setChallenge(ch);
        setAuditTrail(trail);
        setAnalyticsSummary(getAnalyticsSummary());
      } catch (err) {
        console.error("Admin load error:", err);
      }
    };
    load();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsUnverified(false);
    setResendStatus(null);
    setLoginLoading(true);

    try {
      const res = await loginOrganizer(email, password);
      if (res.success && res.user) {
        const session = getCurrentSession();
        setAuthSession(session);
        setIsAuthenticated(true);
      } else {
        if (res.error === "unverified") {
          setIsUnverified(true);
          setUnverifiedEmail(email);
          setAuthError(res.message || "Your account has not been activated yet.");
        } else {
          setAuthError(res.message || "Invalid email or password.");
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || "An error occurred while signing in.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logoutOrganizer();
    setAuthSession(null);
    setIsAuthenticated(false);
  };

  const handleResendActivation = async () => {
    if (!unverifiedEmail) return;
    setResendStatus("Sending fresh activation link...");
    const res = await resendActivation(unverifiedEmail);
    setResendStatus(res.message);
  };

  const handleApproveManualCheckIn = async () => {
    if (!authSession?.user) return;
    setManualFeedback(null);
    const res = await repository.approveManualCheckIn({
      participantId: manualParticipantId,
      participantName: manualParticipantName,
      locationId: manualVenueId,
      verificationMethod: manualMethod,
      adminEmail: authSession.user.email,
      adminName: authSession.user.name,
      notes: manualNotes,
    });
    setManualFeedback({
      type: res.success ? "success" : "error",
      text: res.message,
      approvalLink: res.approvalLink,
    });
    if (res.success) {
      setManualNotes("");
      setAuditTrail(await repository.getManualCheckInAuditTrail());
      setAnalyticsSummary(getAnalyticsSummary());
    }
  };

  const handleRejectManualCheckIn = async () => {
    if (!authSession?.user) return;
    setManualFeedback(null);
    const res = await repository.rejectManualCheckIn({
      participantId: manualParticipantId,
      participantName: manualParticipantName,
      locationId: manualVenueId,
      verificationMethod: manualMethod,
      adminEmail: authSession.user.email,
      adminName: authSession.user.name,
      notes: manualNotes,
    });
    setManualFeedback({
      type: res.success ? "success" : "error",
      text: res.message,
    });
    if (res.success) {
      setManualNotes("");
      setAuditTrail(await repository.getManualCheckInAuditTrail());
    }
  };

  const handleCopyText = async (text: string, id: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedLinkId(id);
      setTimeout(() => setCopiedLinkId(null), 2200);
    } catch {
      // ignore
    }
  };

  const handleUpdateStatus = async (
    eventId: string,
    status: FestivalEvent["scheduleStatus"],
    notice?: string
  ) => {
    await repository.updateEventScheduleStatus(eventId, status, notice);
    const updated = await repository.getEvents();
    setEvents(updated);
  };

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    await repository.publishNotice({
      title: noticeTitle,
      content: noticeContent,
      level: noticeLevel,
      isActive: true,
    });

    const refreshed = await repository.getNotices();
    setNotices(refreshed);
    setNoticeTitle("");
    setNoticeContent("");
    setNoticeSuccess(true);
    setTimeout(() => setNoticeSuccess(false), 3000);
  };

  const getCheckInUrl = (v: VenueLocation) => {
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : FESTIVAL_CONFIG.appUrl;
    return `${origin}/check-in/${v.id}?token=${v.qrCodeToken}`;
  };

  const getQrImageUrl = (v: VenueLocation, size = 400) => {
    const url = getCheckInUrl(v);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(
      url
    )}`;
  };

  const handleDownloadQr = async (venue: VenueLocation) => {
    const qrUrl = getQrImageUrl(venue, 600);
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `klik-qr-${venue.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrUrl, "_blank");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-8 max-w-sm mx-auto space-y-5 animate-in fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-festival hover:text-teal-light"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Festival App</span>
        </Link>

        <div className="bg-parchment-50 p-6 sm:p-7 rounded-3xl border border-parchment-300 shadow-card text-center space-y-4">
          <div className="w-14 h-14 mx-auto mb-1">
            <Image
              src="/assets/klik-round-logo-128.png"
              alt="KliK Logo"
              width={56}
              height={56}
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h2 className="font-serif font-bold text-xl text-teal-festival">
              Organizer Portal
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Sign in with your festival staff account to update schedules, artist statuses, and broadcast notices.
            </p>
          </div>

          {/* Unverified Account Alert Banner */}
          {isUnverified && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-left space-y-2 animate-in zoom-in-95">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <strong className="block font-bold">Email Confirmation Required</strong>
                  <span>
                    Your account has not been activated yet. Please click the confirmation link sent to your email to activate your account.
                  </span>
                </div>
              </div>

              {resendStatus ? (
                <div className="text-[11px] text-teal-festival font-semibold pt-1">
                  {resendStatus}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendActivation}
                  className="w-full mt-1 py-1.5 px-3 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-xs font-bold transition-colors"
                >
                  Resend Confirmation Email
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5 pt-1 text-left">
            {authError && !isUnverified && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="organizer@klik2026.co.za"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-xs text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-[11px] font-semibold text-teal-festival hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-xs text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In as Organizer</span>
              )}
            </button>
          </form>

          {/* Staff Registration Link (Invite Code Required) */}
          <div className="pt-2 border-t border-parchment-200 text-xs space-y-1.5">
            <div className="text-ink-muted text-xs pt-1">
              Have a staff invite code?{" "}
              <Link
                href="/admin/register"
                className="font-bold text-teal-festival hover:underline"
              >
                Register organizer account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6 animate-in fade-in">
      {/* Admin Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-terracotta-festival text-white">
              Staff Portal
            </span>
            <span className="text-xs text-ink-muted">
              {authSession?.user?.name || "Lead Organizer"} ({authSession?.user?.email || "admin@klik2026.co.za"})
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl text-teal-festival mt-1">
            Festival Operations
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-lg bg-parchment-200 text-xs font-semibold text-ink-festival hover:bg-parchment-300 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <LogOut className="w-3.5 h-3.5 text-ink-muted" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-parchment-200 p-1 rounded-2xl text-xs font-bold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("events")}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "events" ? "bg-teal-festival text-white shadow-sm" : "text-ink-muted"
          }`}
        >
          Events ({events.length})
        </button>

        <button
          onClick={() => setActiveTab("venues")}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "venues" ? "bg-teal-festival text-white shadow-sm" : "text-ink-muted"
          }`}
        >
          Venues ({venues.length})
        </button>

        <button
          onClick={() => setActiveTab("notices")}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "notices" ? "bg-teal-festival text-white shadow-sm" : "text-ink-muted"
          }`}
        >
          Notices ({notices.length})
        </button>

        <button
          onClick={() => setActiveTab("quest")}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "quest" ? "bg-teal-festival text-white shadow-sm" : "text-ink-muted"
          }`}
        >
          Culture Trail
        </button>
      </div>

      {/* Tab: Events Management */}
      {activeTab === "events" && (
        <div className="space-y-3">
          <p className="text-xs text-ink-muted">
            Quickly update live statuses (Happening Now, Moved, Cancelled) to notify all festival attendees in real time.
          </p>

          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200 shadow-subtle space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-terracotta-festival">
                    {evt.date} • {evt.startTime}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-teal-festival">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-ink-muted">{evt.venueName}</p>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    evt.scheduleStatus === "happening_now"
                      ? "bg-terracotta-festival text-white"
                      : evt.scheduleStatus === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : evt.scheduleStatus === "moved"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-parchment-200 text-ink-festival"
                  }`}
                >
                  {evt.scheduleStatus.replace("_", " ")}
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <button
                  onClick={() => handleUpdateStatus(evt.id, "happening_now")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-teal-festival text-white hover:bg-teal-light"
                >
                  Set Live
                </button>
                <button
                  onClick={() => handleUpdateStatus(evt.id, "scheduled")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-parchment-200 text-ink-festival hover:bg-parchment-300"
                >
                  Reset Scheduled
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(evt.id, "moved", "Relocated to Town Hall foyer due to weather")
                  }
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200"
                >
                  Mark Moved
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(evt.id, "cancelled", "Cancelled by artist management")
                  }
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Venues Management */}
      {activeTab === "venues" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-parchment-50 p-4 rounded-2xl border border-parchment-200">
            <div>
              <h2 className="font-serif font-bold text-sm text-teal-festival">
                Culture Trail Venues & Physical Signage
              </h2>
              <p className="text-xs text-ink-muted">
                {venues.length} registered festival venues. Print official A4 signage with QR codes for attendees to scan.
              </p>
            </div>
            {venues.length > 0 && (
              <button
                type="button"
                onClick={() => setPosterVenue(venues[0])}
                className="px-3.5 py-2 rounded-xl bg-teal-festival hover:bg-teal-light text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Signs</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {venues.map((v) => (
              <div
                key={v.id}
                className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200 shadow-subtle flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-teal-festival">
                        {v.name}
                      </h3>
                      <p className="text-xs text-ink-muted mt-0.5">{v.address}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-ink-muted bg-parchment-200 px-2 py-0.5 rounded-full shrink-0">
                      {v.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-parchment-100 p-2.5 rounded-xl">
                    <img
                      src={getQrImageUrl(v, 120)}
                      alt={`QR code for ${v.name}`}
                      className="w-12 h-12 object-contain bg-white rounded-lg p-0.5 shrink-0 border border-parchment-200"
                    />
                    <div className="min-w-0 text-[11px] font-mono text-teal-festival break-all">
                      <span className="text-[10px] block font-sans font-semibold uppercase text-ink-muted">Token</span>
                      {v.qrCodeToken}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-parchment-200/80">
                  <button
                    type="button"
                    onClick={() => setPosterVenue(v)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-terracotta-festival hover:bg-terracotta-festival/90 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Sign</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadQr(v)}
                    className="py-1.5 px-2.5 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-ink-festival text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    title="Download PNG QR Code"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">QR</span>
                  </button>

                  <a
                    href={getCheckInUrl(v)}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-2.5 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-ink-festival text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    title="Test Check-In Page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Notices Management */}
      {activeTab === "notices" && (
        <div className="space-y-4">
          {/* Publish Notice Form */}
          <form
            onSubmit={handlePublishNotice}
            className="bg-parchment-50 p-4 rounded-2xl border border-parchment-300 space-y-3 shadow-subtle"
          >
            <h3 className="font-serif font-bold text-sm text-teal-festival flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-terracotta-festival" />
              <span>Broadcast New Notice</span>
            </h3>

            <div>
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="Notice headline..."
                className="w-full p-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-xs focus:ring-2 focus:ring-teal-festival"
                required
              />
            </div>

            <div>
              <textarea
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                placeholder="Notice details..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-xs focus:ring-2 focus:ring-teal-festival"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <select
                value={noticeLevel}
                onChange={(e) =>
                  setNoticeLevel(e.target.value as "info" | "important" | "urgent")
                }
                className="p-2 rounded-xl bg-parchment-100 border border-parchment-300 text-xs"
              >
                <option value="info">Info Level</option>
                <option value="important">Important (Banner)</option>
                <option value="urgent">Urgent Alert</option>
              </select>

              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light"
              >
                Publish Notice
              </button>
            </div>

            {noticeSuccess && (
              <p className="text-xs text-eucalyptus-dark font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-eucalyptus-festival" />
                <span>Notice published to all festival guests!</span>
              </p>
            )}
          </form>

          {/* Existing Notices */}
          <div className="space-y-2.5">
            <h4 className="font-serif font-bold text-xs text-teal-festival">
              Live Notices ({notices.length})
            </h4>
            {notices.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <strong className="font-bold text-teal-festival">{n.title}</strong>
                  <span className="text-[10px] uppercase font-bold text-terracotta-festival">
                    {n.level}
                  </span>
                </div>
                <p className="text-ink-muted">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: KLiK Quest Manual Approvals, Analytics & Check-In Stations */}
      {activeTab === "quest" && challenge && (
        <div className="space-y-4">
          {/* Quest Overview Card */}
          <div className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-festival">
                  Competition Prize Pool: {QUEST_CONFIG.formattedPrizeValue}
                </span>
                <h3 className="font-serif font-bold text-base text-teal-festival">
                  {challenge.title}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  WhatsApp Verification &amp; Entry Desk: {QUEST_CONFIG.whatsappIntlDisplay}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("venues")}
                className="px-3 py-1.5 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Signs</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-3 rounded-xl bg-parchment-100">
                <span className="text-ink-muted block text-[10px]">Required Stops:</span>
                <span className="font-bold text-base text-teal-festival">
                  {challenge.requiredCheckInCount} of {venues.length} Locations
                </span>
              </div>
              <div className="p-3 rounded-xl bg-parchment-100">
                <span className="text-ink-muted block text-[10px]">Manual Audit Entries:</span>
                <span className="font-bold text-base text-terracotta-festival">
                  {auditTrail.length} Recorded
                </span>
              </div>
            </div>
          </div>

          {/* Secure Manual Check-In Approval Form (Method C: Selfie / WhatsApp Verification) */}
          <div className="bg-parchment-50 p-4 sm:p-5 rounded-2xl border border-parchment-300 space-y-3.5 shadow-subtle">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-serif font-bold text-sm text-teal-festival flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-terracotta-festival" />
                  <span>Manual Check-In Approval (WhatsApp Selfie Verification)</span>
                </h4>
                <p className="text-xs text-ink-muted mt-0.5">
                  Verify photographic proof received on {QUEST_CONFIG.whatsappIntlDisplay}, then approve or reject the check-in below. Duplicate approvals are automatically blocked.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                  Participant Reference ID *
                </label>
                <input
                  type="text"
                  value={manualParticipantId}
                  onChange={(e) => setManualParticipantId(e.target.value)}
                  placeholder="e.g. klik_anon_abc123_..."
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-white border border-parchment-300 text-xs font-mono text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                  Participant Name (Optional)
                </label>
                <input
                  type="text"
                  value={manualParticipantName}
                  onChange={(e) => setManualParticipantName(e.target.value)}
                  placeholder="From WhatsApp message"
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-white border border-parchment-300 text-xs text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                  Participating Establishment *
                </label>
                <select
                  value={manualVenueId}
                  onChange={(e) => setManualVenueId(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-white border border-parchment-300 text-xs text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                  Verification Method *
                </label>
                <select
                  value={manualMethod}
                  onChange={(e) =>
                    setManualMethod(e.target.value as CheckInVerificationMethod)
                  }
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-white border border-parchment-300 text-xs text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
                >
                  <option value="manual_whatsapp_selfie">
                    WhatsApp Selfie Proof (QR / Staff)
                  </option>
                  <option value="manual_staff_override">
                    In-Person Staff Override
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Verification / Rejection Notes
              </label>
              <input
                type="text"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="e.g. Selfie with venue QR poster confirmed on WhatsApp"
                className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-white border border-parchment-300 text-xs text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleApproveManualCheckIn}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-olive-festival hover:bg-olive-dark text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Approve Manual Check-In</span>
              </button>

              <button
                type="button"
                onClick={handleRejectManualCheckIn}
                className="sm:w-auto min-h-[44px] py-2.5 px-4 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Proof</span>
              </button>
            </div>

            {manualFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs space-y-2 ${
                  manualFeedback.type === "success"
                    ? "bg-olive-festival/12 border border-olive-festival/30 text-teal-festival"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                <p className="font-semibold leading-relaxed">{manualFeedback.text}</p>
                {manualFeedback.approvalLink && (
                  <div className="space-y-1.5 pt-1 border-t border-olive-festival/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                      Signed Confirmation Link (Reply to participant on WhatsApp):
                    </span>
                    <div className="p-2 rounded-lg bg-white border border-parchment-300 font-mono text-[10px] break-all text-teal-festival">
                      {manualFeedback.approvalLink}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(manualFeedback.approvalLink!, "latest_approval")
                      }
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-teal-festival hover:bg-teal-light text-white text-[11px] font-bold inline-flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>
                        {copiedLinkId === "latest_approval"
                          ? "Confirmation Link Copied!"
                          : "Copy Confirmation Link for WhatsApp"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual Verification Audit Trail */}
          <div className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-teal-festival">
                Manual Verification Audit Trail ({auditTrail.length})
              </h4>
              <div className="relative sm:w-56">
                <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter by participant or venue..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-parchment-300 text-xs"
                />
              </div>
            </div>

            {auditTrail.length === 0 ? (
              <p className="text-xs text-ink-muted py-3 text-center">
                No manual check-in approvals or rejections recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {auditTrail
                  .filter((entry) => {
                    if (!auditSearch.trim()) return true;
                    const q = auditSearch.toLowerCase();
                    return (
                      entry.participantId.toLowerCase().includes(q) ||
                      (entry.participantName || "").toLowerCase().includes(q) ||
                      entry.locationName.toLowerCase().includes(q)
                    );
                  })
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-xl bg-white border border-parchment-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              entry.action === "approved"
                                ? "bg-olive-festival text-white"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {entry.action}
                          </span>
                          <strong className="font-serif font-bold text-teal-festival">
                            {entry.locationName}
                          </strong>
                        </div>
                        <span className="text-[10px] text-ink-muted">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-[11px] text-ink-festival flex flex-wrap gap-x-3 gap-y-0.5">
                        <span className="font-mono">Ref: {entry.participantId}</span>
                        {entry.participantName && (
                          <span>Name: {entry.participantName}</span>
                        )}
                        <span>Method: {entry.verificationMethod}</span>
                        <span>By: {entry.adminEmail}</span>
                      </div>

                      {entry.notes && (
                        <p className="text-[11px] text-ink-muted">{entry.notes}</p>
                      )}

                      {entry.approvalLink && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(entry.approvalLink!, entry.id)}
                          className="text-[11px] font-bold text-teal-festival hover:underline inline-flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>
                            {copiedLinkId === entry.id
                              ? "Link Copied!"
                              : "Copy Signed Approval Link"}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Privacy-Conscious Sponsor & Quest Engagement Analytics */}
          {analyticsSummary && (
            <div className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-teal-festival flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-terracotta-festival" />
                  <span>Sponsor Exposure &amp; Quest Analytics (Privacy-Safe Local Metrics)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setAnalyticsSummary(getAnalyticsSummary())}
                  className="text-[11px] font-semibold text-teal-festival hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-parchment-200">
                  <span className="text-[10px] text-ink-muted block">Banner Clicks</span>
                  <strong className="text-base text-teal-festival">
                    {analyticsSummary.homeQuestBannerClicks}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-parchment-200">
                  <span className="text-[10px] text-ink-muted block">Quest Starts</span>
                  <strong className="text-base text-teal-festival">
                    {analyticsSummary.questStarts}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-parchment-200">
                  <span className="text-[10px] text-ink-muted block">Completions</span>
                  <strong className="text-base text-olive-dark">
                    {analyticsSummary.questCompletions}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-parchment-200">
                  <span className="text-[10px] text-ink-muted block">WhatsApp Entries</span>
                  <strong className="text-base text-terracotta-festival">
                    {analyticsSummary.questEntryWhatsAppClicks}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-parchment-100 text-center">
                  <span className="text-ink-muted block">QR Check-ins</span>
                  <strong className="text-sm text-teal-festival">
                    {analyticsSummary.checkInMethods.qr}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-parchment-100 text-center">
                  <span className="text-ink-muted block">GPS Check-ins</span>
                  <strong className="text-sm text-teal-festival">
                    {analyticsSummary.checkInMethods.gps}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-parchment-100 text-center">
                  <span className="text-ink-muted block">Manual Check-ins</span>
                  <strong className="text-sm text-teal-festival">
                    {analyticsSummary.checkInMethods.manual_whatsapp_selfie +
                      analyticsSummary.checkInMethods.manual_staff_override}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {QUEST_SPONSORS.map((s) => {
                  const m = analyticsSummary.sponsors[s.id] || {
                    impressions: 0,
                    cardClicks: 0,
                    whatsappClicks: 0,
                  };
                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-white border border-parchment-200 text-xs space-y-1.5"
                    >
                      <strong className="font-serif font-bold text-teal-festival block">
                        {s.name}
                      </strong>
                      <div className="flex items-center justify-between text-[11px] text-ink-muted">
                        <span>Impressions: <strong className="text-teal-festival">{m.impressions}</strong></span>
                        <span>Card Clicks: <strong className="text-teal-festival">{m.cardClicks}</strong></span>
                        <span className="inline-flex items-center gap-0.5">
                          <MessageCircle className="w-3 h-3 text-[#1E7E45]" />
                          <strong className="text-[#1E7E45]">{m.whatsappClicks}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Existing 8 Check-In Stations (Preserved QR Signs) */}
          <div className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200 space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-teal-festival">
              Check-In Stations ({venues.length}) — Existing Distributed QR Codes Preserved
            </h4>
            <div className="space-y-2">
              {venues.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-parchment-100 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <strong className="block font-serif font-bold text-teal-festival truncate">
                      {v.name}
                    </strong>
                    <span className="text-[10px] text-ink-muted">{v.address}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPosterVenue(v)}
                    className="px-3 py-1.5 rounded-lg bg-terracotta-festival hover:bg-terracotta-festival/90 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Sign</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Official A4 Printable Poster Modal */}
      {posterVenue && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-a4-sign, #printable-a4-sign * {
                visibility: visible !important;
              }
              #printable-a4-sign {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 3.5rem 3rem !important;
                box-shadow: none !important;
                border: 4px solid #263E47 !important;
                border-radius: 0 !important;
                background: #F7F4EC !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                align-items: center !important;
                z-index: 99999 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-4 sm:p-6 my-auto space-y-4">
            {/* Modal Controls Bar */}
            <div className="no-print flex items-center justify-between gap-2 pb-3 border-b border-parchment-200">
              <div>
                <h3 className="font-serif font-bold text-base text-teal-festival">
                  Official A4 Trail Sign Preview
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Ready to print or save as PDF for physical venue display.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadQr(posterVenue)}
                  className="px-3 py-1.5 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-ink-festival text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Download PNG QR Code"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-terracotta-festival hover:bg-terracotta-festival/90 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print A4 Sign</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPosterVenue(null)}
                  className="px-2.5 py-1.5 rounded-xl text-ink-muted hover:text-ink-festival hover:bg-parchment-200 text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Poster Preview */}
            <div className="overflow-x-auto p-1 bg-parchment-200/50 rounded-2xl">
              <div
                id="printable-a4-sign"
                className="w-full max-w-md mx-auto aspect-[1/1.414] bg-[#F7F4EC] border-4 border-[#263E47] p-6 sm:p-8 text-center flex flex-col justify-between items-center shadow-md rounded-2xl relative"
              >
                {/* Decorative border inset */}
                <div className="absolute inset-2 border border-[#D75A35]/40 rounded-xl pointer-events-none" />

                {/* Festival Identity Header */}
                <div className="space-y-1 w-full pt-2">
                  <div className="text-3xl font-serif font-black tracking-wider text-[#263E47]">
                    KLiK
                  </div>
                  <div className="text-[10px] sm:text-xs font-sans uppercase font-bold tracking-widest text-[#747A57]">
                    Kleinmond Inniebos Kunstefees
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-[#263E47]/70 font-medium">
                    27–29 November 2026 • Kleinmond
                  </div>
                  <div className="w-16 h-0.5 bg-[#D75A35] mx-auto mt-2" />
                </div>

                {/* Culture Trail Title & Tagline */}
                <div className="space-y-1.5 my-2">
                  <div className="text-xs sm:text-sm font-sans uppercase font-extrabold tracking-widest text-[#263E47] bg-[#263E47]/10 px-3 py-1 rounded-full inline-block">
                    KLiK CULTURE TRAIL
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#D75A35]">
                    You&apos;re here!
                  </h2>
                  <p className="text-xs sm:text-sm font-sans font-bold tracking-wide uppercase text-[#263E47]">
                    Scan to check in
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#263E47]/80 max-w-xs mx-auto">
                    Point your phone camera at this QR code to log this stop in your festival digital guide.
                  </p>
                </div>

                {/* High Resolution QR Code */}
                <div className="my-2 p-3 bg-white rounded-2xl shadow-sm border-2 border-[#263E47]/15 inline-block">
                  <img
                    src={getQrImageUrl(posterVenue, 360)}
                    alt={`QR Code for ${posterVenue.name}`}
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain mx-auto"
                    crossOrigin="anonymous"
                  />
                </div>

                {/* Venue Details */}
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-[#263E47]">
                    {posterVenue.name}
                  </h3>
                  <p className="text-xs text-[#263E47]/80 font-medium">
                    {posterVenue.address}
                  </p>
                </div>

                {/* Footer Message */}
                <div className="space-y-1 w-full pt-2 pb-1 border-t border-[#263E47]/20">
                  <div className="text-xs sm:text-sm font-serif font-bold text-[#263E47]">
                    Continue exploring Kleinmond
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-[#263E47]/70 max-w-xs mx-auto">
                    Visit 5 festival venues, collect your check-ins, and send your Lucky Draw Ticket directly via WhatsApp from the app to enter the community prize draw!
                  </p>
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#747A57] font-semibold pt-0.5">
                    Official Festival Guide • klik2026.netlify.app
                  </div>
                </div>
              </div>
            </div>

            {/* Hint */}
            <p className="no-print text-center text-[11px] text-ink-muted">
              Tip: Click &quot;Print A4 Sign&quot; and select &quot;Save as PDF&quot; or print directly onto card stock for physical display at {posterVenue.name}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
