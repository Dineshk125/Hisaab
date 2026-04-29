"use client";

import { useState } from "react";
import { updatePassword } from "@/actions/security";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ChevronLeft, Lock, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SecurityPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      await updatePassword(formData);
      toast.success("Password updated successfully!");
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-32">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link href="/profile">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-orange-500 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </Link>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
            <Shield className="h-8 w-8 text-emerald-500" />
            Security
          </h1>
          <p className="text-muted-foreground font-medium">Protect your account and managed sensitive data.</p>
        </div>

        <Card className="bento-card glass-card border-white/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-black">Change Password</CardTitle>
                <CardDescription className="text-xs font-medium">Update your account password regularly.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Password</Label>
                <div className="relative">
                  <Input 
                    name="currentPassword" 
                    type="password" 
                    required 
                    className="pl-10 rounded-xl bg-white/5 border-white/10"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Password</Label>
                  <div className="relative">
                    <Input 
                      name="newPassword" 
                      type="password" 
                      required 
                      className="pl-10 rounded-xl bg-white/5 border-white/10"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirm New Password</Label>
                  <div className="relative">
                    <Input 
                      name="confirmPassword" 
                      type="password" 
                      required 
                      className="pl-10 rounded-xl bg-white/5 border-white/10"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bento-card glass-card border-white/5 opacity-60">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Two-Factor Authentication</CardTitle>
            <CardDescription className="text-xs">Coming soon: Add an extra layer of security.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
