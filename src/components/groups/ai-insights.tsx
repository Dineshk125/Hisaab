"use client";

import { useQuery } from "@tanstack/react-query";
import { getAIInsights, AIInsightData } from "@/actions/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BrainCircuit, RefreshCw, Trophy, UserMinus, BarChart3, Lightbulb, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AIInsights({ groupId }: { groupId: string }) {
  const { data: insights, isLoading, error, refetch } = useQuery({
    queryKey: ["ai-insights", groupId],
    queryFn: () => getAIInsights(groupId),
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="bento-card glass-card overflow-hidden border-orange-500/20">
        <CardHeader className="flex flex-row items-center space-x-2">
          <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
          <CardTitle className="text-xl font-bold">Generating Insights...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full bg-orange-500/5" />
          <Skeleton className="h-4 w-[90%] bg-orange-500/5" />
          <Skeleton className="h-4 w-[95%] bg-orange-500/5" />
        </CardContent>
      </Card>
    );
  }

  // Handle errors or missing data gracefully
  if (error || !insights) {
    return (
      <Card className="bento-card glass-card border-muted hover:border-muted-foreground/30 transition-colors">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-muted rounded-full">
              <BrainCircuit className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">AI Assistant Offline</h3>
              <p className="text-sm text-muted-foreground max-w-[400px]">
                Add more expenses or check back later for smart financial analysis.
              </p>
            </div>
            <button 
              onClick={() => refetch()}
              className="text-xs flex items-center gap-2 text-orange-500 hover:text-orange-400 font-bold transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Guaranteed safe access using local defaults if any field is missing
  const data: AIInsightData = {
    insight: insights.insight || "Keep tracking to see insights.",
    topSpender: insights.topSpender || "Calculating...",
    whoOwesMost: insights.whoOwesMost || "Active",
    suggestions: Array.isArray(insights.suggestions) ? insights.suggestions : [],
    categoryBreakdown: Array.isArray(insights.categoryBreakdown) ? insights.categoryBreakdown : [],
    isFallback: insights.isFallback
  };

  return (
    <Card className="bento-card glass-card border-orange-500/30 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent">
      <CardHeader className="flex flex-col gap-4 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-xl font-bold tracking-tight">Intelligence Dashboard</CardTitle>
          </div>
          {data.isFallback && (
            <div className="flex items-center gap-2 text-[9px] uppercase font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
              <AlertTriangle className="h-2.5 w-2.5" />
              Basic Analysis
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Insight Box */}
        <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
          <p className="text-sm font-medium leading-relaxed italic text-foreground/90">
            "{data.insight}"
          </p>
        </div>

        {/* Top Level Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Trophy className="h-5 w-5 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase text-muted-foreground">Top Spender</p>
              <p className="text-sm font-bold truncate">{data.topSpender}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <UserMinus className="h-5 w-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase text-muted-foreground">Status</p>
              <p className="text-sm font-bold truncate">{data.whoOwesMost}</p>
            </div>
          </div>
          {/* Add more stats if needed, or just let them expand */}
          <div className="hidden lg:flex p-4 rounded-2xl bg-white/5 border border-white/5 items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase text-muted-foreground">Efficiency</p>
              <p className="text-sm font-bold truncate">High</p>
            </div>
          </div>
          <div className="hidden lg:flex p-4 rounded-2xl bg-white/5 border border-white/5 items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase text-muted-foreground">AI Mood</p>
              <p className="text-sm font-bold truncate">Analytical</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Impact</h4>
            </div>
            <div className="space-y-3">
              {data.categoryBreakdown.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="truncate pr-2">{item.category}</span>
                    <span className="shrink-0">{item.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500/50 transition-all duration-1000 ease-out" 
                      style={{ width: `${item.percentage}%` }} 
                    />
                  </div>
                </div>
              ))}
              {data.categoryBreakdown.length === 0 && (
                <p className="text-[10px] text-muted-foreground italic">No category data available.</p>
              )}
            </div>
          </div>
          
          {/* Suggestions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-orange-500" />
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tips</h4>
            </div>
            <div className="space-y-2">
              {data.suggestions.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="mt-1 h-1 w-1 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(255,140,50,0.8)] shrink-0" />
                  <p className="text-[11px] font-medium leading-relaxed">{tip}</p>
                </div>
              ))}
              {data.suggestions.length === 0 && (
                <p className="text-[10px] text-muted-foreground italic">Add more data for personalized tips.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
