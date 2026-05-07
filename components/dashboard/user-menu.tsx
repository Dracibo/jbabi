import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

export function UserMenu({ name, email }: { name?: string | null; email?: string | null }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="icon-btn"
        title={`Se déconnecter${email ? ` (${email})` : ""}`}
        aria-label="Se déconnecter"
      >
        <LogOut size={18} strokeWidth={1.6} />
      </button>
      <span className="sr-only">{name ?? "Patron"}</span>
    </form>
  );
}
