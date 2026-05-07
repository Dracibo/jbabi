import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { LiveTime } from "./live-time";
import { UserMenu } from "./user-menu";
import { Bell } from "lucide-react";

export async function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const session = await auth();
  return (
    <>
      {/* Mobile-only top bar with logo + actions */}
      <div className="mobile-header">
        <Link href="/" aria-label="Accueil JBABI" className="flex items-center">
          <Image src="/logo.jpg" alt="JBABI" width={80} height={36} priority className="object-contain" />
        </Link>
        <div className="flex items-center gap-2">
          <button className="icon-btn relative" aria-label="Notifications" style={{ width: 36, height: 36 }}>
            <Bell size={16} strokeWidth={1.6} />
            <span className="dot-orange" />
          </button>
          <UserMenu name={session?.user?.name} email={session?.user?.email} />
        </div>
      </div>

      <header className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="header-title num text-[24px] sm:text-[28px] font-medium leading-tight" style={{ color: "var(--navy)" }}>
            {title}
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--muted)" }}>{subtitle}</p>
        </div>
        {/* Desktop-only actions (mobile actions live in .mobile-header) */}
        <div className="hidden lg:flex items-center gap-2">
          <button className="icon-btn relative" aria-label="Notifications">
            <Bell size={18} strokeWidth={1.6} />
            <span className="dot-orange" />
          </button>
          <UserMenu name={session?.user?.name} email={session?.user?.email} />
        </div>
      </header>
      <div className="live-time-strip flex items-center justify-end mb-4">
        <LiveTime />
      </div>
    </>
  );
}
