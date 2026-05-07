import { auth } from "@/auth";
import { LiveTime } from "./live-time";
import { UserMenu } from "./user-menu";
import { Bell } from "lucide-react";

export async function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const session = await auth();
  return (
    <>
      <header className="flex items-center gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="header-title num text-[28px] font-medium leading-tight" style={{ color: "var(--navy)" }}>
            {title}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="icon-btn relative" aria-label="Notifications">
            <Bell size={18} strokeWidth={1.6} />
            <span className="dot-orange" />
          </button>
          <UserMenu name={session?.user?.name} email={session?.user?.email} />
        </div>
      </header>
      <div className="flex items-center justify-end mb-4">
        <LiveTime />
      </div>
    </>
  );
}
