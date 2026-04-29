"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, ChevronLeft, Sparkles, Send, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Reset code sent!");
        setStep(2);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to send code");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      if (res.ok) {
        toast.success("Password reset successfully!");
        window.location.href = "/login";
      } else {
        const err = await res.json();
        toast.error(err.message || "Reset failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black selection:bg-orange-500 selection:text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] -z-10" />

      <Card className="w-[450px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/5 bg-zinc-950/50 backdrop-blur-2xl rounded-[2.5rem] p-4">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="flex justify-center mb-4">
             <div className="relative w-16 h-16 rounded-2xl border border-white/10 p-3 bg-white/5">
                <Image src="/icons/icon-512x512.png" alt="Logo" fill sizes="64px" className="object-cover p-2" />
             </div>
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter gradient-text">
            {step === 1 ? "Reset Password" : step === 2 ? "Verify Code" : "New Password"}
          </CardTitle>
          <CardDescription className="text-zinc-500 font-medium">
            {step === 1 ? "Enter your email to receive a secure reset link." : step === 2 ? `Enter the 6-digit code sent to ${email}` : "Create a strong new password for your account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-orange-500/50 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="h-14 bg-white text-black hover:bg-orange-500 hover:text-white transition-all duration-500 font-black rounded-2xl uppercase tracking-widest text-xs mt-2">
                {isLoading ? "Sending Code..." : "Send Reset Code"}
                {!isLoading && <Send className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="grid gap-6">
               <div className="grid gap-4">
                  <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Enter 6-Digit Code</Label>
                  <Input 
                    id="otp" 
                    placeholder="000000" 
                    maxLength={6}
                    className="h-20 text-center text-4xl font-black tracking-[0.5em] bg-white/5 border-white/10 rounded-3xl focus:border-orange-500 transition-all"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
               </div>
               <Button type="submit" className="h-14 bg-orange-500 text-white hover:bg-orange-600 transition-all duration-500 font-black rounded-2xl uppercase tracking-widest text-xs">
                Verify Code
              </Button>
              <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                Back to Email
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="grid gap-4">
               <div className="grid gap-2">
                  <Label htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input 
                      id="newPassword" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter new password"
                      className="pl-12 pr-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-orange-500/50 transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Confirm Password</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm new password"
                      className="pl-12 pr-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-orange-500/50 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="h-14 bg-white text-black hover:bg-orange-500 hover:text-white transition-all duration-500 font-black rounded-2xl uppercase tracking-widest text-xs mt-2">
                  {isLoading ? "Resetting..." : "Reset Password"}
                  {!isLoading && <Sparkles className="ml-2 h-4 w-4" />}
                </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center pb-8">
           <Link href="/login" className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-orange-500 transition-colors">
             <ChevronLeft className="h-4 w-4" />
             Back to Sign In
           </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
