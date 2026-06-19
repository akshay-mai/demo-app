"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  occupation?: string;
  nationality?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [kycStatus, setKycStatus] = useState<boolean | null>(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [sdkLoading, setSdkLoading] = useState(false);
  const [error, setError] = useState("");

  const checkKycStatus = useCallback(async (token: string) => {
    setKycLoading(true);
    try {
      const res = await fetch("/api/kyc/check-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.result?.status !== undefined) {
        setKycStatus(data.result.status);
      } else {
        setKycStatus(false);
      }
    } catch {
      setKycStatus(false);
    } finally {
      setKycLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (!token || !stored) {
      router.push("/");
      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch {
      router.push("/");
      return;
    }

    checkKycStatus(token);
  }, [router, checkKycStatus]);

  const handleCompleteKyc = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSdkLoading(true);
    setError("");
    try {
      const res = await fetch("/api/kyc/get-sdk-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      const verifyUrl =
        data?.result?.verifyUrl ||
        data?.verifyUrl ||
        data?.result?.url ||
        data?.url;

      if (verifyUrl) {
        window.open(verifyUrl, "_blank");
      } else {
        setError("Could not get KYC verification URL. Please try again.");
      }
    } catch {
      setError("Failed to initiate KYC. Please try again.");
    } finally {
      setSdkLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">KYC Demo</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Complete KYC Button — shown if not verified */}
            {!kycLoading && kycStatus === false && (
              <button
                onClick={handleCompleteKyc}
                disabled={sdkLoading}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {sdkLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Initiating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Complete KYC
                  </>
                )}
              </button>
            )}

            {/* KYC Completed badge */}
            {!kycLoading && kycStatus === true && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 font-semibold px-5 py-2.5 rounded-xl text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                KYC Completed
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2.5 rounded-xl hover:bg-gray-100 transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, {user.name}!
          </h2>
          <p className="text-gray-500 mt-1">Here&apos;s an overview of your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* KYC Status Banner */}
        <div className={`rounded-2xl p-6 mb-8 flex items-center justify-between ${
          kycLoading
            ? "bg-gray-100"
            : kycStatus
            ? "bg-green-50 border border-green-200"
            : "bg-orange-50 border border-orange-200"
        }`}>
          {kycLoading ? (
            <div className="flex items-center gap-3 text-gray-500">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Checking KYC status...
            </div>
          ) : kycStatus ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-green-800 text-lg">KYC Verified</p>
                <p className="text-green-600 text-sm">Your identity has been successfully verified</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-orange-800 text-lg">KYC Not Verified</p>
                  <p className="text-orange-600 text-sm">Please complete your KYC verification to access all features</p>
                </div>
              </div>
              <button
                onClick={handleCompleteKyc}
                disabled={sdkLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
              >
                {sdkLoading ? "Initiating..." : "Verify Now"}
              </button>
            </div>
          )}
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <InfoCard icon="👤" title="Personal Info">
            <InfoRow label="Name" value={user.name} />
            <InfoRow label="Email" value={user.email} />
            {user.gender && <InfoRow label="Gender" value={user.gender} />}
            {user.phone && <InfoRow label="Phone" value={user.phone} />}
          </InfoCard>

          <InfoCard icon="📍" title="Address">
            {user.address && <InfoRow label="Street" value={user.address} />}
            {user.city && <InfoRow label="City" value={user.city} />}
            {user.state && <InfoRow label="State" value={user.state} />}
            {user.country && <InfoRow label="Country" value={user.country} />}
          </InfoCard>

          <InfoCard icon="💼" title="Additional Info">
            {user.occupation && <InfoRow label="Occupation" value={user.occupation} />}
            {user.nationality && <InfoRow label="Nationality" value={user.nationality} />}
            <InfoRow
              label="KYC Status"
              value={
                kycLoading
                  ? "Checking..."
                  : kycStatus
                  ? "Verified ✅"
                  : "Pending ⚠️"
              }
            />
          </InfoCard>
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-700 text-right">{value}</span>
    </div>
  );
}
