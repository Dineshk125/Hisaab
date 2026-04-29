"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Lock, ChevronRight, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

import { Turnstile } from "@marsidev/react-turnstile";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isHuman, setIsHuman] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHuman) {
      toast.error("Please complete the security verification");
      return;
    }
    
    setIsLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      window.location.href = "/dashboard";
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black selection:bg-orange-500 selection:text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] -z-10" />

      <Card className="w-[450px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/5 bg-zinc-950/50 backdrop-blur-2xl rounded-[2.5rem] p-4">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="flex justify-center mb-4">
             <div className="relative w-16 h-16 rounded-2xl border border-white/10 p-3 bg-white/5">
                <Image src="/icons/icon-512x512.png" alt="Logo" fill sizes="64px" className="object-cover p-2" />
             </div>
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter gradient-text">Welcome Back</CardTitle>
          <CardDescription className="text-zinc-500 font-medium">
            Continue your premium financial journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
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
            <div className="grid gap-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Password</Label>
                <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:opacity-80 transition-opacity">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password"
                  className="pl-12 pr-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-orange-500/50 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Original Cloudflare Turnstile (Clean Integration) */}
            <div className="flex justify-center min-h-[65px]">
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

            <Button type="submit" disabled={isLoading} className="h-14 bg-white text-black hover:bg-orange-500 hover:text-white transition-all duration-500 font-black rounded-2xl uppercase tracking-widest text-xs mt-2">
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-[#09090b] px-4 text-zinc-500">
                Or continue with
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 font-black uppercase tracking-widest text-[10px]" 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <Image src="/google.svg" alt="Google" width={18} height={18} className="mr-3 invert opacity-80" />
            Google Account
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center pb-8">
           <p className="text-xs font-bold text-zinc-500">
             Don&apos;t have an account? <Link href="/register" className="text-orange-500 hover:underline">Register Now</Link>
           </p>
        </CardFooter>
      </Card>
    </div>
  );
}
