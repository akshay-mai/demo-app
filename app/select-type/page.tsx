"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SelectTypeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "complete-profile";

  const [selected, setSelected] = useState<"KYC" | "KYB" | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
  }, [router]);

  const handleContinue = async () => {
    if (!selected) {
      setError("Please select a verification type to continue.");
      return;
    }
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verificationType: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save selection.");
        return;
      }
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        localStorage.setItem("user", JSON.stringify({ ...user, verificationType: selected }));
      }
      router.push(`/${next}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Choose Verification Type</h1>
          <p className="text-gray-500 mt-2">Select how you would like to verify your identity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Individual / KYC */}
          <button
            onClick={() => { setSelected("KYC"); setError(""); }}
            className={`relative group rounded-2xl border-2 p-8 text-left transition-all duration-200 cursor-pointer ${
              selected === "KYC"
                ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
            }`}
          >
            {selected === "KYC" && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
              selected === "KYC" ? "bg-blue-500" : "bg-blue-100 group-hover:bg-blue-200"
            }`}>
              <svg className={`w-7 h-7 ${selected === "KYC" ? "text-white" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className={`text-xl font-bold mb-1 ${selected === "KYC" ? "text-blue-700" : "text-gray-800"}`}>
              Individual
            </h2>
            <p className={`text-sm font-semibold mb-3 ${selected === "KYC" ? "text-blue-500" : "text-gray-400"}`}>
              KYC — Know Your Customer
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              For personal accounts. Verify your identity with a government-issued ID such as Aadhaar, PAN, or Passport.
            </p>
          </button>

          {/* Business / KYB */}
          <button
            onClick={() => { setSelected("KYB"); setError(""); }}
            className={`relative group rounded-2xl border-2 p-8 text-left transition-all duration-200 cursor-pointer ${
              selected === "KYB"
                ? "border-purple-500 bg-purple-50 shadow-lg shadow-purple-100"
                : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
            }`}
          >
            {selected === "KYB" && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
              selected === "KYB" ? "bg-purple-500" : "bg-purple-100 group-hover:bg-purple-200"
            }`}>
              <svg className={`w-7 h-7 ${selected === "KYB" ? "text-white" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className={`text-xl font-bold mb-1 ${selected === "KYB" ? "text-purple-700" : "text-gray-800"}`}>
              Business
            </h2>
            <p className={`text-sm font-semibold mb-3 ${selected === "KYB" ? "text-purple-500" : "text-gray-400"}`}>
              KYB — Know Your Business
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              For business accounts. Verify your company with registration documents, GST, or other business credentials.
            </p>
          </button>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={loading || !selected}
          className={`w-full font-bold py-4 px-8 rounded-2xl text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
            selected === "KYB"
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              Continue
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function SelectTypePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </div>
        </div>
      }
    >
      <SelectTypeContent />
    </Suspense>
  );
}
