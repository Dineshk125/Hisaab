"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button 
      variant="destructive" 
      size="lg" 
      className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-xl"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="h-5 w-5" />
      Sign Out
    </Button>
  );
}
