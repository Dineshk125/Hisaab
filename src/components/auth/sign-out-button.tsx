"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button 
      variant="outline" 
      size="lg" 
      className="cursor-pointer w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-xl border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-500 cursor-pointer"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="h-5 w-5" />
      Sign Out
    </Button>
  );
}
