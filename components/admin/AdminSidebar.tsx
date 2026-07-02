"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/products", label: "Products", icon: "🍌" },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-cream/10 bg-surface px-4 py-6">
      <div className="mb-8 px-2">
        <p className="font-display text-lg font-semibold text-cream">
          Crispy Munchies
        </p>
        <p className="mt-1 font-mono text-xs text-cream/50">
          {adminName}
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-sm transition ${
                isActive
                  ? "bg-gold/15 text-gold"
                  : "text-cream/70 hover:bg-cream/5 hover:text-cream"
              }`}
            >
              <span aria-hidden>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-sm text-cream/50 transition hover:bg-cream/5 hover:text-cream"
      >
        <span aria-hidden>🚪</span>
        Sign out
      </button>
    </aside>
  );
}