"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError) {
      setError("账号或密码错误，请重新输入。");
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
      callbackUrl: "/",
    });
    setLoading(false);

    if (result?.error) {
      setError("账号或密码错误，请检查后再试。");
      return;
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-16">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
              Todo Login
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">登录</h1>
            <p className="mt-1 text-sm text-slate-600">
              使用固定账号体验 TODO 管理。
            </p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
            账号: todolistusername
            <br />
            密码: todolistpwd
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              账号
              <input
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="todolistusername"
                className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                autoComplete="username"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              密码
              <input
                type="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="todolistpwd"
                className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                autoComplete="current-password"
              />
            </label>
            {error ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
