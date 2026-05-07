"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <label className="block">
        <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="search-bar mt-1.5 px-3.5"
          placeholder="patron@jbabi.ci"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          Mot de passe
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="search-bar mt-1.5 px-3.5"
          placeholder="••••••••"
        />
      </label>

      {state.error ? (
        <div className="badge b-red text-sm" role="alert" style={{ padding: "8px 12px" }}>
          {state.error}
        </div>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-orange w-full justify-center disabled:opacity-60">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
