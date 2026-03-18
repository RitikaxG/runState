"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const ok = await signIn(email, password);
    if (ok) {
      router.push("/dashboard");
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <h1>Sign in to RunState</h1>

        <div style={{ marginTop: 16 }}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </div>

        {error ? (
          <p style={{ color: "red", marginTop: 12 }}>{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          style={{ width: "100%", marginTop: 20, padding: 12 }}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}