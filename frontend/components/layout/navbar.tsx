"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { useStaffAccess } from "@/hooks/use-staff-access";
import { cn } from "@/lib/utils";

const customerNavigationItems = [
  { href: "/", label: "Home" },
  { href: "/verify", label: "Check Item" },
  { href: "/history", label: "View History" }
];

export function Navbar() {
  const pathname = usePathname();
  const {
    hasStaffRole,
    isConnected,
    isResolvingAccess,
    publicDemoMode,
    roleSummary,
    staffActions,
    primaryRoute,
    hasOwnedPassports,
    ownerTransferHref
  } =
    useStaffAccess();
  const isStaffRoute =
    pathname === "/staff" ||
    pathname === "/register" ||
    pathname === "/transfer" ||
    pathname === "/service";
  const visibleNavigationItems = (
    hasStaffRole && !isResolvingAccess
      ? customerNavigationItems.filter((item) => item.href !== "/")
      : customerNavigationItems
  ).concat(
    publicDemoMode ? [{ href: "/demo", label: "Public Demo" }] : []
  ).concat(
    isConnected && !isResolvingAccess && hasOwnedPassports
      ? [{ href: ownerTransferHref, label: "Send Passport" }]
      : []
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/60 backdrop-blur-xl">
      <div className="container py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={isResolvingAccess ? pathname : hasStaffRole ? primaryRoute : "/"}
              className="flex items-center gap-3"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7c2d12,#1c1917)] text-sm font-bold text-white shadow-lg shadow-stone-950/20">
                LT
              </span>
              <span>
                <span className="block font-display text-xl font-semibold tracking-tight">
                  LuxeTrace
                </span>
                <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Luxury item passport
                </span>
              </span>
            </Link>
            <div className="md:hidden">
              <WalletConnectButton />
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between xl:justify-end">
            <div className="flex flex-col gap-2">
              <nav className="flex flex-wrap items-center gap-1 rounded-full border border-white/80 bg-white/70 p-1 shadow-soft">
                {visibleNavigationItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-slate-950/5 hover:text-foreground",
                        isActive && "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {isResolvingAccess ? (
                <p className="px-1 text-xs text-muted-foreground">
                  Updating account...
                </p>
              ) : hasStaffRole ? (
                <div className="space-y-2 px-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <Link
                      href="/staff"
                      className={cn(
                        "font-medium underline-offset-4 hover:text-foreground hover:underline",
                        isStaffRoute && "text-foreground"
                      )}
                    >
                      {roleSummary}
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {staffActions.map((action) => {
                      const isActive = pathname === action.href;

                      return (
                        <Link
                          key={action.href}
                          href={action.href}
                          className={cn(
                            "rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-slate-950/5 hover:text-foreground",
                            isActive && "border-stone-900/15 bg-stone-950 text-white"
                          )}
                        >
                          {action.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : isConnected ? (
                <p className="px-1 text-xs text-muted-foreground">
                  Customer view
                </p>
              ) : null}
            </div>

            <div className="hidden md:flex md:flex-col md:items-end md:pl-2">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Account
              </p>
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
