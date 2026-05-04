"use client";

import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  Area,
  ComposedChart,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIInsights } from "./ai-insights";

const COLORS = ["#f97316", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"];

export function GroupAnalytics({ expenses, groupId }: { expenses: any[]; groupId: string }) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Aggregate data for category chart
  const categoryData = expenses.reduce((acc: any, curr) => {
    const existing = acc.find((item: any) => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  // Create a 14-day continuous timeline
  const timelineData = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    
    const dailyExpenses = expenses.filter(exp => 
      new Date(exp.createdAt).toLocaleDateString() === date.toLocaleDateString()
    );
    
    const amount = dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { date: dateStr, amount, rawDate: date };
  });

  // Add cumulative data
  let runningTotal = 0;
  const enrichedTimelineData = timelineData.map(item => {
    runningTotal += item.amount;
    return { ...item, cumulative: runningTotal };
  });

  const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="w-full">
        <AIInsights groupId={groupId} />
      </div>

      {!mounted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-80 bg-muted/20 rounded-3xl" />
          <div className="h-80 col-span-2 bg-muted/20 rounded-3xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
          {/* Category Allocation */}
          <Card className="bento-card glass-card relative overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black tracking-tight flex items-center justify-between">
                <span>Expense Split</span>
                <span className="text-orange-500 text-sm">₹{totalSpending.toLocaleString()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[450px] w-full pt-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={115}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value: any) => [`₹${(Number(value) || 0).toLocaleString()}`, 'Amount']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    layout="vertical"
                    iconType="circle"
                    formatter={(value, entry: any) => {
                      const amount = categoryData.find((d: any) => d.name === value)?.value || 0;
                      return (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-2">
                          {value} <span className="text-white ml-2">₹{amount.toLocaleString()}</span>
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Total</p>
                <p className="text-2xl font-black gradient-text">₹{totalSpending.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Spending Velocity & Trend */}
          <Card className="bento-card glass-card md:col-span-1 2xl:col-span-2 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black tracking-tight">Spending Velocity & Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <ComposedChart data={enrichedTimelineData} margin={{ top: 30, right: 10, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,140,50,0.05)', radius: 8 }}
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    iconType="rect"
                    formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{value}</span>}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    name="Cumulative Spend"
                    stroke="#f97316" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCum)" 
                    animationDuration={2000}
                  />
                  <Bar 
                    dataKey="amount" 
                    name="Daily Spend"
                    fill="#3b82f6" 
                    radius={[6, 6, 0, 0]} 
                    barSize={24}
                    animationDuration={1500}
                  >
                    <LabelList 
                      dataKey="amount" 
                      position="top" 
                      offset={10}
                      formatter={(val: any) => (Number(val) || 0) > 0 ? `₹${(Number(val) || 0).toLocaleString()}` : ''}
                      style={{ fill: '#888', fontSize: 9, fontWeight: 'bold', fontFamily: 'inherit' }}
                    />
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
