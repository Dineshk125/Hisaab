import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ExpenseList } from "@/components/groups/expense-list";
import { GroupBalances } from "@/components/groups/group-balances";
import { GroupTimeline } from "@/components/groups/group-timeline";
import { GroupAnalytics } from "@/components/groups/group-analytics";
import { AddExpenseDialog } from "@/components/groups/add-expense-dialog";
import { ManageMembers } from "@/components/groups/manage-members";
import { ExportButton } from "@/components/groups/export-button";
import { EditGroupDialog } from "@/components/groups/edit-group-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Wallet, History, BarChart3, Settings2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getGroupBalances, getGroupExpenses, getPendingSettlements } from "@/actions/expense";
import { PendingSettlements } from "@/components/groups/pending-settlements";

export default async function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: true },
      },
      expenses: {
        include: { paidBy: true },
        orderBy: { createdAt: "desc" },
      },
      activityLogs: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!group) redirect("/dashboard");

  const expenses = await getGroupExpenses(group.id);
  const balances = await getGroupBalances(group.id);
  const pendingSettlements = await getPendingSettlements(group.id, session.user.id);

  const currentUser = group.members.find((m: any) => m.userId === session.user.id)?.user;
  const isAdmin = group.adminId === session.user.id;

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="expenses" className="w-full flex flex-col">
        {/* Top Header Section (Scrolls away) */}
        <div className="w-full border-b border-white/5 bg-background">
          <div className="w-full px-4 md:px-8 lg:px-12 py-6">
            <div className="flex flex-col gap-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="pl-0 h-6 hover:bg-transparent text-muted-foreground hover:text-orange-500 transition-colors">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Back to Dashboard</span>
                </Button>
              </Link>
              
              <div className="flex flex-col gap-4">
                <div className="space-y-1">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter gradient-text leading-none">{group.name}</h1>
                  <p className="text-xs md:text-sm text-muted-foreground font-black uppercase tracking-[0.2em] opacity-70">
                    {group.members.length} Members • {expenses.length} Expenses
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <ExportButton group={group} expenses={expenses} balances={balances} />
                  <ManageMembers group={group} currentUser={session.user} />
                  <AddExpenseDialog group={group} currentUser={session.user} />
                  {isAdmin && <EditGroupDialog group={group} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Tab Navigation (Stays at the top) */}
        <div className="sticky top-0 z-30 w-full border-b border-white/5 bg-background/80 backdrop-blur-2xl py-4">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <TabsList className="grid grid-cols-4 w-full h-14 p-1.5 bg-muted/30 rounded-2xl border border-white/5 relative">
              <TabsTrigger value="expenses" className="w-full rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300">
                <Receipt className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline font-bold">Expenses</span>
              </TabsTrigger>
              <TabsTrigger value="balances" className="w-full rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300">
                <Wallet className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline font-bold">Balances</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="w-full rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300">
                <History className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline font-bold">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="w-full rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300">
                <BarChart3 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline font-bold">Insights</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="w-full px-4 md:px-8 lg:px-12 py-8">
          <div className="pb-32">
            {/* Global Pending Section */}
            {pendingSettlements.length > 0 && (
              <div className="mb-8">
                <PendingSettlements settlements={pendingSettlements} currentUser={session.user} />
              </div>
            )}

            <TabsContent value="expenses" className="m-0 border-0 p-0 focus-visible:ring-0">
              <div className="flex flex-col gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">Recent Expenses</h2>
              </div>
              <ExpenseList expenses={expenses} group={group} currentUser={session.user} />
            </TabsContent>

            <TabsContent value="balances" className="m-0 border-0 p-0 focus-visible:ring-0">
              <GroupBalances balances={balances} group={group} currentUser={currentUser} groupId={group.id} />
            </TabsContent>

            <TabsContent value="timeline" className="m-0 border-0 p-0 focus-visible:ring-0">
              <div className="flex flex-col gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">Activity History</h2>
              </div>
              <GroupTimeline logs={group.activityLogs} />
            </TabsContent>

            <TabsContent value="analytics" className="m-0 border-0 p-0 focus-visible:ring-0">
              <div className="flex flex-col gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">Intelligence Dashboard</h2>
              </div>
              <GroupAnalytics expenses={expenses} groupId={group.id} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
