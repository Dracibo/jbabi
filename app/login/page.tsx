import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex justify-center mb-6">
            <Image src="/logo.jpg" alt="JBABI" width={120} height={120} priority className="object-contain" />
          </div>
          <h1 className="num text-[24px] font-medium text-center" style={{ color: "var(--navy)" }}>
            Connexion
          </h1>
          <p className="text-sm text-center mt-1" style={{ color: "var(--muted)" }}>
            Accédez au tableau de bord JBABI
          </p>
          <LoginForm />
        </div>
        <p className="text-center text-xs mt-4" style={{ color: "var(--muted-2)" }}>
          Réservé au patron · Suivi de l&apos;activité de livraison
        </p>
      </div>
    </main>
  );
}
