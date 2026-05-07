"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
    return { error: null };
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        return { error: "Email ou mot de passe incorrect." };
      }
      return { error: "Connexion impossible. Réessaie." };
    }
    throw err;
  }
}
