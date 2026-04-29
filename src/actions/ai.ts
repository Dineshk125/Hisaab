"use server";

import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIInsightData {
  insight: string;
  topSpender: string;
  whoOwesMost: string;
  suggestions: string[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  isFallback?: boolean;
}

export async function getAIInsights(groupId: string): Promise<AIInsightData | null> {
  try {
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { paidBy: true },
      orderBy: { createdAt: "desc" },
    });

    if (expenses.length === 0) return null;

    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Calculate real Top Spender for fallback
    const spenderStats = expenses.reduce((acc: any, curr) => {
      const name = curr.paidBy.name || "Unknown";
      acc[name] = (acc[name] || 0) + curr.amount;
      return acc;
    }, {});
    const topSpenderName = Object.entries(spenderStats).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "Calculating...";

    const categoryStats = expenses.reduce((acc: any, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    
    const categoryBreakdown = Object.entries(categoryStats).map(([category, amount]) => ({
      category,
      amount: amount as number,
      percentage: Math.round(((amount as number) / total) * 100)
    })).sort((a, b) => b.amount - a.amount);

    const topCategory = categoryBreakdown[0]?.category;

    const defaultFallback: AIInsightData = {
      insight: `Your group has managed ₹${total.toLocaleString()} in shared expenses so far. Based on the data, here is your financial summary.`,
      topSpender: topSpenderName,
      whoOwesMost: "Active",
      suggestions: [`Your spending is highest in "${topCategory}".`, "Add more expenses for deeper analysis."],
      categoryBreakdown,
      isFallback: true
    };

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial assistant for Hisaab. Provide insights in JSON format: { 'insight': '...', 'topSpender': '...', 'whoOwesMost': '...', 'suggestions': ['...'], 'categoryBreakdown': [{'category': '...', 'amount': 0, 'percentage': 0}] }"
          },
          {
            role: "user",
            content: `Analyze: ${JSON.stringify(expenses.map(e => ({ amount: e.amount, category: e.category, paidBy: e.paidBy.name })))}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        insight: result.insight || defaultFallback.insight,
        topSpender: result.topSpender || defaultFallback.topSpender,
        whoOwesMost: result.whoOwesMost || defaultFallback.whoOwesMost,
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : defaultFallback.suggestions,
        categoryBreakdown: Array.isArray(result.categoryBreakdown) ? result.categoryBreakdown : defaultFallback.categoryBreakdown,
      };
    } catch (openaiError: any) {
      console.warn("AI Quota Exceeded, using local fallback.");
      return defaultFallback;
    }
  } catch (error) {
    console.error("AI Insight Error:", error);
    return null;
  }
}
