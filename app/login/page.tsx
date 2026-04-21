"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FirebaseError } from "firebase/app";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase-client";
import { getUsers, saveUsers, setCurrentUser, type StoredUser } from "@/lib/local-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const getGoogleLoginErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/popup-closed-by-user":
        return "Ban da dong cua so dang nhap Google truoc khi hoan tat.";
      case "auth/popup-blocked":
        return "Trinh duyet dang chan popup. Hay cho phep popup va thu lai.";
      case "auth/cancelled-popup-request":
        return "Yeu cau dang nhap popup bi huy. Vui long thu lai.";
      case "auth/network-request-failed":
        return "Loi mang khi ket noi Google. Kiem tra Internet roi thu lai.";
      case "auth/unauthorized-domain":
        return "Domain hien tai chua duoc phep trong Firebase Auth (Authorized domains).";
      case "auth/operation-not-allowed":
        return "Google Sign-In chua duoc bat trong Firebase Authentication.";
      default:
        return `Dang nhap Google that bai (${errorCode}). Vui long thu lai.`;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();
    const user = users.find(
      (item) => item.email === normalizedEmail && item.password === password
    );

    if (!user) {
      setError("Email hoac mat khau khong dung.");
      return;
    }

    if (user.isLocked) {
      setError("Tai khoan cua ban da bi khoa. Vui long lien he admin.");
      return;
    }

    setCurrentUser({
      name: user.name,
      email: user.email,
      role: user.role,
      isLocked: user.isLocked,
    });
    router.push("/");
  };

  const handleGoogleLogin = async () => {
    setError("");

    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setError("Chua cau hinh Firebase. Them bien NEXT_PUBLIC_FIREBASE_* trong .env.local.");
      return;
    }

    try {
      setIsGoogleLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const googleEmail = result.user.email?.trim().toLowerCase();

      if (!googleEmail) {
        setError("Khong lay duoc email tu tai khoan Google.");
        return;
      }

      const users = getUsers();
      const existedUser = users.find((user) => user.email === googleEmail);
      const role = existedUser?.role ?? "user";
      const isLocked = existedUser?.isLocked ?? false;
      const name =
        result.user.displayName?.trim() ||
        existedUser?.name ||
        googleEmail.split("@")[0];

      if (isLocked) {
        setError("Tai khoan cua ban da bi khoa. Vui long lien he admin.");
        return;
      }

      if (!existedUser) {
        const newUser: StoredUser = {
          name,
          email: googleEmail,
          password: "google-oauth",
          role,
          isLocked,
        };
        saveUsers([...users, newUser]);
      }

      setCurrentUser({ name, email: googleEmail, role, isLocked });
      router.push(role === "admin" ? "/admin" : "/");
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setError(getGoogleLoginErrorMessage(error.code));
      } else {
        setError("Dang nhap Google that bai. Vui long thu lai.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f8ff] via-[#eef2ff] to-[#f5f5f5] px-6 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-100/50 backdrop-blur">
        <h1 className="text-3xl text-center font-bold text-gray-900">Login</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              className="w-full text-black rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black"
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
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full text-black rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full  rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Login
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="mt-3 flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-800 shadow-md transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            className="mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-0.5 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
              fill="#FBBC05"
            />
            <path
              d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
              fill="#EB4335"
            />
            <path
              d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
              fill="#34A853"
            />
            <path
              d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
              fill="#4285F4"
            />
          </svg>
          <span>
            {isGoogleLoading ? "Dang dang nhap Google..." : "Continue with Google"}
          </span>
        </button>

        <p className="mt-6 text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-medium text-black underline">
            Dang ky
          </Link>
        </p>
      </div>
    </main>
  );
}
