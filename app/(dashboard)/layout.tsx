import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="main flex-1 min-w-0 px-6 lg:px-8 py-6">{children}</main>
      </div>
      <MobileNav />
    </>
  );
}
