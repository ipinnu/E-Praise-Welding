"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

type Mode = "login" | "register";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-yellow-DEFAULT flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-white rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/portal/chat";

  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setError(error.message);
      } else {
        setRegistered(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push(next);
        router.refresh();
      }
    }

    setLoading(false);
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-yellow-DEFAULT flex items-center justify-center px-6">
        <div className="bg-white border-2 border-black shadow-[8px_8px_0_#000] max-w-md w-full p-10 text-center">
          <div className="w-12 h-12 bg-black flex items-center justify-center mx-auto mb-6">
            <span className="text-yellow-DEFAULT text-2xl font-black">✓</span>
          </div>
          <h2 className="font-kanit font-black text-2xl uppercase mb-3">
            Check Your Email
          </h2>
          <p className="font-kanit text-black/60 text-sm">
            We sent a confirmation link to <strong>{email}</strong>. Click it to
            activate your account, then come back to sign in.
          </p>
          <button
            onClick={() => setMode("login")}
            className="mt-8 w-full bg-black text-white font-kanit font-bold text-sm uppercase tracking-widest py-3 border-2 border-black shadow-[3px_3px_0_#FFD700] hover:shadow-[1px_1px_0_#FFD700] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-DEFAULT flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-white">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="E-Praise Welding" width={40} height={40} />
          <div className="flex flex-col leading-none">
            <span className="font-kanit font-black text-sm uppercase tracking-wider text-black">E-Praise</span>
            <span className="font-kanit font-medium text-xs uppercase tracking-widest text-yellow-DEFAULT">Welding</span>
          </div>
        </Link>
        <span className="font-kanit font-bold text-xs uppercase tracking-widest text-black/40">
          Client Portal
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="bg-white border-2 border-black shadow-[8px_8px_0_#000] max-w-md w-full p-10">
          {/* Mode toggle */}
          <div className="flex border-2 border-black mb-8">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-3 font-kanit font-bold text-xs uppercase tracking-widest transition-all duration-150 ${
                  mode === m
                    ? "bg-black text-white"
                    : "bg-white text-black/50 hover:text-black"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {mode === "register" && (
              <div>
                <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/50 block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="w-full border-2 border-black px-4 py-3 font-kanit text-sm focus:outline-none focus:border-yellow-DEFAULT transition-colors duration-150 placeholder:text-black/30"
                />
              </div>
            )}

            <div>
              <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/50 block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border-2 border-black px-4 py-3 font-kanit text-sm focus:outline-none focus:border-yellow-DEFAULT transition-colors duration-150 placeholder:text-black/30"
              />
            </div>

            <div>
              <label className="font-kanit font-bold text-xs uppercase tracking-widest text-black/50 block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full border-2 border-black px-4 py-3 font-kanit text-sm focus:outline-none focus:border-yellow-DEFAULT transition-colors duration-150 placeholder:text-black/30"
              />
            </div>

            {error && (
              <p className="font-kanit text-red-500 text-sm border-l-4 border-red-500 pl-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-yellow-DEFAULT text-black font-kanit font-black text-sm uppercase tracking-widest py-4 border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0"
            >
              {loading
                ? "..."
                : mode === "login"
                  ? "Sign In →"
                  : "Create Account →"}
            </button>
          </form>

          <p className="font-kanit text-black/40 text-xs text-center mt-6">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-black underline font-semibold"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
