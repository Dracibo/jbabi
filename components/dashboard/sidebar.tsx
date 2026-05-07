"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Package, Users, Wallet, History } from "lucide-react";

const NAV = [
  { href: "/", label: "Vue d'ensemble", Icon: LayoutGrid },
  { href: "/livraisons", label: "Livraisons", Icon: Package },
  { href: "/livreurs", label: "Livreurs", Icon: Users },
  { href: "/depenses", label: "Dépenses", Icon: Wallet },
  { href: "/historique", label: "Historique", Icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar w-[260px] flex-none p-4 sticky top-0 h-screen">
      <div className="card h-full flex flex-col p-4" style={{ borderRadius: 22 }}>
        <Link href="/" className="flex items-center justify-center py-4 mb-3">
          <Image src="/logo.jpg" alt="JBABI" width={120} height={120} className="h-24 w-auto object-contain" priority />
        </Link>

        <div className="section-label mt-2 mb-2">Principal</div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
            return (
              <Link key={href} href={href} className={cn("nav-item", active && "active")}>
                <Icon className="ico" strokeWidth={1.6} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />
      </div>
    </aside>
  );
}
