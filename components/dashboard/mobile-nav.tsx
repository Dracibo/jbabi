"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Users, Wallet, History, Package } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Vue", Icon: LayoutGrid },
  { href: "/livraisons", label: "Livr.", Icon: Package },
  { href: "/livreurs", label: "Livreurs", Icon: Users },
  { href: "/depenses", label: "Dépenses", Icon: Wallet },
  { href: "/historique", label: "Histo", Icon: History },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-nav">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
        return (
          <Link key={href} href={href} className={cn(active && "active")}>
            <Icon size={20} strokeWidth={1.6} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
