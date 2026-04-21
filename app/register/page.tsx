"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { registerWithPassword } from "@/lib/client-api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await registerWithPassword(name, email, password, confirmPassword);
      window.dispatchEvent(new Event("auth-changed"));
      window.location.replace("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Dang ky that bai.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f8ff] via-[#eef2ff] to-[#f5f5f5] px-6 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-100/50 backdrop-blur">
        <h1 className="text-3xl text-center font-bold text-gray-900">Create account</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full text-black rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              minLength={6}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full text-black rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-black underline">
            Dang nhap
          </Link>
        </p>
      </div>
    </main>
  );
}
