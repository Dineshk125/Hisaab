"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, User, Bell, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  // Do not show bottom nav on landing or auth pages
  const authPages = ["/", "/login", "/register", "/forgot-password"];
  if (authPages.includes(pathname)) return null;

  const navItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: Users, label: "Groups", href: "/groups" },
    { icon: Bell, label: "Activity", href: "/activity" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[450px]">
      <div className="bg-card/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between px-8 h-20">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={index} 
              href={item.href} 
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-500 group",
                isActive ? "text-orange-500 scale-110" : "text-muted-foreground hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-orange-500/10" : "group-hover:bg-white/5"
              )}>
                <Icon className={cn("h-6 w-6 md:h-7 md:w-7", isActive && "drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]")} />
              </div>
              <span className={cn(
                "text-[10px] md:text-[11px] font-black uppercase mt-1 tracking-[0.1em]",
                isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
