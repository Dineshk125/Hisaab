"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Lock, User, CheckCircle2, ChevronRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

import { Turnstile } from "@marsidev/react-turnstile";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isHuman, setIsHuman] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: details, 2: otp
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHuman) {
      toast.error("Please complete the security verification");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) {
        toast.success("OTP sent to your email!");
        setStep(2);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
    setIsLoading(false);
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, otp }),
      });

      if (res.ok) {
        toast.success("Account created! Please log in.");
        window.location.href = "/login";
      } else {
        const error = await res.json();
        toast.error(error.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Registration failed");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black selection:bg-orange-500 selection:text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <Card className="w-[500px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/5 bg-zinc-950/50 backdrop-blur-2xl rounded-[2.5rem] p-4 my-8">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="flex justify-center mb-4">
             <div className="relative w-16 h-16 rounded-2xl border border-white/10 p-3 bg-white/5">
                <Image src="/icons/icon-512x512.png" alt="Logo" fill sizes="64px" className="object-cover p-2" />
             </div>
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter gradient-text">
            {step === 1 ? "Create Account" : "Verify Email"}
          </CardTitle>
          <CardDescription className="text-zinc-500 font-medium">
            {step === 1 ? "Join the most premium expense sharing platform." : `Enter the code sent to ${formData.email}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-orange-500/50 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-orange-500/50 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                     <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Password</Label>
                     <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                       <Input 
                         id="password" 
                         type={showPassword ? "text" : "password"} 
                         placeholder="Enter your password"
                         className="pl-12 pr-10 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-orange-500/50 transition-all text-xs"
                         value={formData.password}
                         onChange={(e) => setFormData({...formData, password: e.target.value})}
                         required
                       />
                       <button
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                       >
                         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </button>
                     </div>
                   </div>
                   <div className="grid gap-2">
                     <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Confirm</Label>
                     <div className="relative">
                       <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                       <Input 
                         id="confirmPassword" 
                         type={showConfirmPassword ? "text" : "password"} 
                         placeholder="Confirm your password"
                         className="pl-12 pr-10 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-orange-500/50 transition-all text-xs"
                         value={formData.confirmPassword}
                         onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                         required
                       />
                       <button
                         type="button"
                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                       >
                         {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </button>
                     </div>
                   </div>
               </div>

              {/* Original Cloudflare Turnstile (Clean Integration) */}
              <div className="mt-2 flex justify-center min-h-[65px]">
                <Turnstile 
                  siteKey="0x4AAAAAADFppwd5hFWBmlf9" 
                  onSuccess={() => setIsHuman(true)}
                  onError={() => setIsHuman(false)}
                  onExpire={() => setIsHuman(false)}
                  options={{
                    theme: 'dark',
                    size: 'flexible',
                  }}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="h-14 bg-white text-black hover:bg-orange-500 hover:text-white transition-all duration-500 font-black rounded-2xl uppercase tracking-widest text-xs mt-4">
                {isLoading ? "Sending OTP..." : "Get Verification Code"}
                {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          ) : (
             <form onSubmit={handleVerifyAndRegister} className="grid gap-6">
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
               <Button type="submit" disabled={isLoading} className="h-14 bg-orange-500 text-white hover:bg-orange-600 transition-all duration-500 font-black rounded-2xl uppercase tracking-widest text-xs">
                {isLoading ? "Verifying..." : "Verify & Create Account"}
                {!isLoading && <ShieldCheck className="ml-2 h-4 w-4" />}
              </Button>
              <div className="flex flex-col items-center gap-4">
                <button 
                  type="button"
                  onClick={handleSendOTP}
                  className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
                >
                  Didn't receive code? Resend
                </button>
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  Change Email / Back
                </button>
              </div>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-[#09090b] px-4 text-zinc-500">
                Quick Signup
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 font-black uppercase tracking-widest text-[10px]" 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <Image src="/google.svg" alt="Google" width={18} height={18} className="mr-3 invert opacity-80" />
            Signup with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center pb-8">
           <p className="text-xs font-bold text-zinc-500">
             Already have an account? <Link href="/login" className="text-orange-500 hover:underline">Sign In</Link>
           </p>
        </CardFooter>
      </Card>
    </div>
  );
}
