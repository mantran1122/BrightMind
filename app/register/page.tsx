"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  getUsers,
  saveUsers,
  setCurrentUser,
  type StoredUser,
  type UserRole,
} from "@/lib/local-auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (password !== confirmPassword) {
      setError("Mat khau nhap lai khong khop.");
      return;
    }

    const users = getUsers();
    const alreadyExists = users.some((user) => user.email === normalizedEmail);

    if (alreadyExists) {
      setError("Email da ton tai. Vui long dang nhap.");
      return;
    }

    const newUser: StoredUser = {
      name: trimmedName,
      email: normalizedEmail,
      password,
      role,
      isLocked: false,
    };

    saveUsers([...users, newUser]);
    setCurrentUser({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isLocked: newUser.isLocked,
    });
    router.push("/");
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
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
              Role (demo)
            </label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black outline-none transition focus:border-black"
            >
              <option value="user">User</option>
            </select>
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
