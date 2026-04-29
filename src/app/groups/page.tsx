import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function GroupsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          _count: { select: { members: true, expenses: true } },
          members: { include: { user: true }, take: 4 }
        }
      }
    },
    orderBy: { group: { updatedAt: "desc" } }
  });

  const groups = memberships.map(m => m.group);

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-10">
      <div className="container mx-auto py-8 md:py-12 px-4 space-y-8">
        <div className="flex flex-col gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-orange-500 transition-colors text-sm font-bold">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-black tracking-tight">Your Circles</h1>
            <Link href="/groups/new">
              <Button size="icon" className="rounded-full h-12 w-12 bg-orange-500 shadow-lg">
                <Plus className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="bento-card glass-card hover:border-orange-500/50 transition-all overflow-hidden group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      <Users className="h-6 w-6" />
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{group._count.expenses} Expenses</Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold mt-4">{group.name}</CardTitle>
                  <CardDescription className="line-clamp-1">{group.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center -space-x-2">
                    {group.members.map((m, i) => (
                      <Avatar key={i} className="border-4 border-background h-10 w-10">
                        <AvatarFallback className="text-[10px] font-bold bg-muted uppercase">{m.user.name?.[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                    {group._count.members > 4 && (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold border-4 border-background">
                        +{group._count.members - 4}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {groups.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="p-6 bg-muted inline-block rounded-full">
                <Users className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-bold">No groups yet</h2>
              <p className="text-muted-foreground">Join a group via link or create a new one.</p>
              <Button render={<Link href="/groups/new" />} className="bg-orange-500 rounded-xl">
                Create Group
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${className}`}>
      {children}
    </span>
  );
}
