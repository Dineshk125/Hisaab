import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Wallet, 
  Users, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  MessageSquare,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white overflow-x-hidden">
      {/* Premium Navbar */}
      <header className="px-6 lg:px-12 h-24 flex items-center border-b border-white/5 sticky top-0 bg-black/60 backdrop-blur-2xl z-50">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-white/10 group-hover:border-orange-500/50 transition-colors">
            <Image 
              src="/icons/icon-512x512.png" 
              alt="Hisaab Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 group-hover:to-orange-500 transition-all duration-500">Hisaab.</span>
        </Link>
        <nav className="ml-auto flex gap-8 items-center">
          <Link className="hidden md:block text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-orange-500 transition-colors" href="/login">
            Sign In
          </Link>
          <Link href="/login">
            <Button className="bg-orange-500 text-white hover:bg-orange-600 transition-all font-black rounded-2xl px-8 h-12 uppercase text-[10px] tracking-widest">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section - The "Hook" */}
        <section className="w-full py-32 md:py-48 flex flex-col items-center justify-center relative">
          {/* Abstract background elements */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] -z-10 animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />
          
          <div className="container px-4 md:px-6 text-center space-y-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 animate-fade-in">
              <Sparkles className="h-3 w-3" />
              Intelligence meets Finance
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.8] mb-4">
                FINANCIAL <br />
                <span className="gradient-text">HARMONY.</span>
              </h1>
              <p className="mx-auto max-w-[800px] text-zinc-400 text-lg md:text-2xl font-medium tracking-tight opacity-80">
                The most premium way to track shared expenses, settle debts, and gain deep AI-powered insights into your group spending.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link href="/login">
                <Button size="lg" className="h-20 px-12 text-lg font-black rounded-3xl bg-white text-black hover:bg-orange-500 hover:text-white transition-all duration-500 group uppercase tracking-widest">
                  Experience Hisaab
                  <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-20 px-12 text-lg font-black rounded-3xl border-white/10 bg-white/5 hover:bg-white/10 transition-all uppercase tracking-widest">
                  View Features
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="w-full py-24 px-4 md:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Feature - Bento 1 */}
            <div className="md:col-span-2 bento-card glass-card p-12 relative overflow-hidden group min-h-[400px]">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <PieChart className="h-40 w-40 text-orange-500" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="h-14 w-14 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
                  <TrendingUp className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="text-4xl font-black tracking-tight">AI Insights Dashboard</h3>
                <p className="text-zinc-400 text-lg max-w-md">Get deep visibility into your spending habits. Our AI analyzes your group's velocity, category split, and identifies potential savings automatically.</p>
              </div>
            </div>

            {/* Bento 2 */}
            <div className="bento-card glass-card p-10 space-y-6 flex flex-col justify-end group">
              <div className="h-14 w-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <Users className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Seamless Groups</h3>
              <p className="text-zinc-500">Create groups for trips, roommates, or partners. Manage members and shared ledgers with absolute precision.</p>
            </div>

            {/* Bento 3 */}
            <div className="bento-card glass-card p-10 space-y-6 flex flex-col justify-end group">
              <div className="h-14 w-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                <Zap className="h-7 w-7 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Rapid Settlement</h3>
              <p className="text-zinc-500">Settle up in seconds. One-tap payment tracking ensures debts are paid without the awkward reminders.</p>
            </div>

            {/* Bento 4 - Large Image/Visual */}
            <div className="md:col-span-2 bento-card glass-card p-12 flex flex-col md:flex-row items-center gap-12 group overflow-hidden">
              <div className="space-y-6 flex-1">
                <div className="h-14 w-14 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                  <ShieldCheck className="h-7 w-7 text-purple-500" />
                </div>
                <h3 className="text-4xl font-black tracking-tight">Trust by Design</h3>
                <p className="text-zinc-400 text-lg">Every transaction is logged, verified, and transparent. We prioritize your financial privacy with enterprise-grade security.</p>
              </div>
              <div className="flex-1 relative w-full h-[200px] md:h-full flex items-center justify-center">
                 <div className="relative w-48 h-48 md:w-64 md:h-64 animate-slow-spin">
                    <Image 
                      src="/icons/icon-512x512.png" 
                      alt="Rotating Logo" 
                      fill 
                      className="object-contain opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
                    />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-32 border-t border-white/5 bg-zinc-950/50">
          <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center space-y-8">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter">READY TO <span className="text-orange-500">HISAAB?</span></h2>
            <p className="text-zinc-500 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">Join thousands of users managing their finances with clarity and style.</p>
            <Link href="/login" className="w-full sm:w-auto flex justify-center">
              <Button size="lg" className="h-16 md:h-20 w-full sm:w-auto px-8 md:px-16 text-base md:text-xl font-black rounded-3xl bg-orange-500 text-white hover:bg-orange-600 transition-all uppercase tracking-widest shadow-[0_20px_50px_rgba(249,115,22,0.3)]">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 bg-black px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <Image src="/icons/icon-512x512.png" alt="Logo" width={32} height={32} />
              <span className="text-xl font-black tracking-tighter">Hisaab.</span>
           </div>
           <p className="text-xs text-zinc-600 font-bold tracking-widest uppercase text-center md:text-right">
             Empowering Your Financial Future. © 2026 Hisaab Inc.
           </p>
        </div>
      </footer>
    </div>
  );
}
