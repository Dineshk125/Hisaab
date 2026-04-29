import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Users, UserPlus } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    const { groupId } = await params;
    redirect(`/login?callbackUrl=/invite/${groupId}`);
  }

  const { groupId } = await params;
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      _count: { select: { members: true } },
    },
  });

  if (!group) redirect("/dashboard");

  // Check if already a member
  const existingMember = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId,
      },
    },
  });

  if (existingMember) redirect(`/groups/${groupId}`);

  async function joinGroup() {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) return;

    await prisma.groupMember.create({
      data: {
        userId: session.user.id,
        groupId,
        role: "MEMBER",
      },
    });

    await prisma.activityLog.create({
      data: {
        groupId,
        userId: session.user.id,
        action: "ADD_MEMBER",
        metadata: { method: "INVITE_LINK" },
      },
    });

    revalidatePath(`/groups/${groupId}`);
    redirect(`/groups/${groupId}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-[450px] w-full bento-card glass-card text-center py-8">
        <CardHeader className="space-y-4">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-2xl">
            <Users className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight">Join {group.name}</CardTitle>
            <CardDescription className="text-lg font-medium">
              You've been invited to join this expense-sharing group.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-2xl bg-muted/50 border border-white/5 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Status</p>
            <p className="text-lg font-bold">{group._count.members} Members active</p>
          </div>
        </CardContent>
        <CardFooter>
          <form action={joinGroup} className="w-full">
            <Button size="lg" className="w-full h-14 text-lg font-bold rounded-2xl bg-orange-500 hover:bg-orange-600 shadow-[0_0_20px_rgba(255,140,50,0.3)]">
              <UserPlus className="mr-2 h-6 w-6" />
              Accept Invitation
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
