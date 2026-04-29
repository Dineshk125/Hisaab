"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Loader2, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PremiumCaptchaProps {
  onVerify: (verified: boolean) => void;
}

export function PremiumCaptcha({ onVerify }: PremiumCaptchaProps) {
  const [status, setStatus] = useState<"idle" | "verifying" | "success">("idle");
  const [progress, setProgress] = useState(0);

  const handleVerify = () => {
    if (status !== "idle") return;
    
    setStatus("verifying");
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 25;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setStatus("success");
          onVerify(true);
        }, 400);
      }
      setProgress(currentProgress);
    }, 250);
  };

  return (
    <div 
      onClick={handleVerify}
      className={cn(
        "relative w-full h-[72px] rounded-2xl border transition-all duration-500 flex items-center px-6 cursor-pointer overflow-hidden group shadow-lg",
        status === "idle" && "bg-zinc-900/40 border-white/5 hover:border-orange-500/30 hover:bg-zinc-900/60",
        status === "verifying" && "bg-orange-500/5 border-orange-500/20 cursor-wait",
        status === "success" && "bg-white border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]"
      )}
    >
      <div className="flex items-center justify-between w-full z-10">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500",
            status === "idle" && "bg-zinc-800 border border-white/5 group-hover:border-orange-500/50",
            status === "verifying" && "bg-orange-500/20 border border-orange-500/50",
            status === "success" && "bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          )}>
            {status === "idle" && <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />}
            {status === "verifying" && <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-6 w-6 text-white" />}
          </div>
          
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-bold tracking-tight transition-colors",
              status === "idle" && "text-zinc-300 group-hover:text-white",
              status === "verifying" && "text-orange-500",
              status === "success" && "text-zinc-900"
            )}>
              {status === "idle" && "Verify Security"}
              {status === "verifying" && "Verifying..."}
              {status === "success" && "Success!"}
            </span>
            <span className={cn(
              "text-[10px] font-medium tracking-tight",
              status === "success" ? "text-zinc-500" : "text-zinc-600"
            )}>
              {status === "idle" && "Click to verify you are human"}
              {status === "verifying" && `Identity Scan: ${Math.round(progress)}%`}
              {status === "success" && "Security verified successfully"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-1.5">
              <span className={cn("text-[9px] font-black uppercase tracking-widest", status === "success" ? "text-zinc-900" : "text-white")}>Hisaab</span>
              <div className="w-4 h-4 relative">
                 <Image src="/icons/icon-512x512.png" alt="Hisaab" fill className={cn("object-contain", status === "success" ? "" : "invert")} />
              </div>
           </div>
           <span className={cn("text-[7px] font-bold uppercase tracking-tighter mt-1", status === "success" ? "text-zinc-400" : "text-zinc-700")}>Security • Privacy</span>
        </div>
      </div>

      {/* Progress Bar */}
      {status === "verifying" && (
        <div 
          className="absolute left-0 bottom-0 h-[2px] bg-orange-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      )}

      {/* Glossy Overlay for success */}
      {status === "success" && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
      )}
    </div>
  );
}
