import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users, ArrowUpRight, Wallet, Receipt } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { getGroups } from "@/actions/group";
import { claimPendingInvitations } from "@/actions/member";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Automatically join groups the user was invited to
  await claimPendingInvitations();

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      _count: {
        select: { expenses: true, members: true },
      },
      expenses: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      members: {
        include: { user: true }
      }
    },
    orderBy: { updatedAt: "desc" },
  });

  // Calculate global stats
  const totalExpensesCount = groups.reduce((acc, g) => acc + g._count.expenses, 0);
  const totalMembersSet = new Set();
  groups.forEach(g => g.members.forEach(m => totalMembersSet.add(m.userId)));
  const uniqueMembersCount = totalMembersSet.size;

  const allGroupIds = groups.map(g => g.id);
  const allExpenses = await prisma.expense.findMany({
    where: { groupId: { in: allGroupIds } },
    select: { amount: true, groupId: true }
  });
  const totalAmountShared = allExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Group amount totals
  const groupTotals = allExpenses.reduce((acc: Record<string, number>, e) => {
    acc[e.groupId] = (acc[e.groupId] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-10">
      <div className="max-w-[1600px] mx-auto py-8 md:py-12 px-4 md:px-8 lg:px-12 space-y-8 md:space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1 md:space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter gradient-text">Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-lg font-medium">
              Welcome back, {session.user.name?.split(' ')[0]}. You have {groups.length} active circles.
            </p>
          </div>
          <Link href="/groups/new" className="w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto rounded-2xl h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(255,140,50,0.3)] bg-orange-500 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95">
              <Plus className="mr-2 h-6 w-6" />
              New Group
            </Button>
          </Link>
        </div>

        {/* Quick Stats Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="bento-card glass-card border-orange-500/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest">Total Shared</CardDescription>
              <Wallet className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-black truncate">₹{totalAmountShared.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground font-bold mt-1">Across all circles</p>
            </CardContent>
          </Card>
          <Card className="bento-card glass-card border-blue-500/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest">Circle Size</CardDescription>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-black">{uniqueMembersCount}</div>
              <p className="text-[10px] text-muted-foreground font-bold mt-1">Unique members</p>
            </CardContent>
          </Card>
          <Card className="bento-card glass-card border-purple-500/10 sm:col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="font-black text-[10px] uppercase tracking-widest">Activity</CardDescription>
              <Receipt className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-black">{totalExpensesCount}</div>
              <p className="text-[10px] text-muted-foreground font-bold mt-1">Total expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Groups Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3">
              Your Groups
              <span className="text-[10px] bg-muted px-2 py-1 rounded-md text-muted-foreground">{groups.length}</span>
            </h2>
            <Button variant="ghost" size="sm" className="font-bold text-orange-500 text-xs">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {groups.map((group: any) => (
              <Link key={group.id} href={`/groups/${group.id}`} className="block group w-full">
                <Card className="bento-card glass-card h-full relative overflow-hidden group-hover:border-orange-500/50 transition-all duration-500">
                  <div className="absolute top-0 right-0 p-4 md:p-6">
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                  </div>
                  
                  <CardHeader className="p-5 md:p-6">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-3 md:mb-4 shadow-lg group-hover:scale-110 transition-transform shrink-0">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-black group-hover:gradient-text transition-all truncate">{group.name}</CardTitle>
                    <CardDescription className="line-clamp-1 font-medium text-xs md:text-sm">{group.description || "No description"}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-5 md:p-6 pt-0 space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3 md:gap-4 py-3 md:py-4 border-y border-white/5">
                      <div className="flex -space-x-2 md:-space-x-3 overflow-hidden">
                        {group.members.slice(0, 4).map((member: any, i: number) => (
                          <Avatar key={i} className="border-2 md:border-4 border-background h-8 w-8 md:h-10 md:w-10 shrink-0">
                            <AvatarFallback className="bg-muted text-[8px] md:text-[10px] font-bold uppercase">
                              {member.user.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {group._count.members > 4 && (
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-muted border-2 md:border-4 border-background flex items-center justify-center text-[8px] md:text-[10px] font-bold shrink-0">
                            +{group._count.members - 4}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                        {group._count.members} Members
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-[8px] md:text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Recent Activity</p>
                        <p className="text-xs md:text-sm font-bold truncate pr-2">
                          {group.expenses[0]?.description || "No expenses yet"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[8px] md:text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Group Total</p>
                        <p className="text-xs md:text-sm font-black text-orange-500">
                          ₹{(groupTotals[group.id] || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            
            {groups.length === 0 && (
              <Link href="/groups/new" className="block group border-2 border-dashed border-white/5 rounded-3xl p-8 md:p-10 hover:border-orange-500/50 transition-all bg-white/5">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 md:p-4 bg-muted rounded-2xl group-hover:bg-orange-500/10 transition-colors">
                    <Plus className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground group-hover:text-orange-500" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg">Create your first group</h3>
                  <p className="text-xs md:text-sm text-muted-foreground max-w-[200px]">Start splitting expenses with friends and family.</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
