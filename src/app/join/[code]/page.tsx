import { getGroupByInviteCode, joinGroupByInviteCode } from "@/actions/group";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Users, UserPlus, LogIn } from "lucide-react";
import Link from "next/link";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const group = await getGroupByInviteCode(code);
  const session = await getServerSession(authOptions);

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-[400px] w-full bento-card glass-card text-center py-10">
          <CardContent className="space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
            <CardDescription>
              This invite link has expired or is invalid. Please ask the group admin for a new link.
            </CardDescription>
            <Button render={<Link href="/dashboard" />} className="w-full rounded-xl">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMember = session?.user?.id && group.members.some(m => m.userId === session.user.id);
  if (isMember) redirect(`/groups/${group.id}`);

  async function handleJoin() {
    "use server";
    try {
      const result = await joinGroupByInviteCode(code);
      redirect(`/groups/${result.groupId}`);
    } catch (error) {
      console.error(error);
    }
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
              You've been invited to join this group.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-2xl bg-muted/50 border border-white/5 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Status</p>
            <p className="text-lg font-bold">{group._count.members} Members active</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {session ? (
            <form action={handleJoin} className="w-full">
              <Button size="lg" className="w-full h-14 text-lg font-bold rounded-2xl bg-orange-500 hover:bg-orange-600 shadow-xl">
                <UserPlus className="mr-2 h-6 w-6" />
                Join Group
              </Button>
            </form>
          ) : (
            <Button 
              size="lg" 
              render={<Link href={`/login?callbackUrl=/join/${code}`} />}
              className="w-full h-14 text-lg font-bold rounded-2xl bg-orange-500 hover:bg-orange-600"
            >
              <LogIn className="mr-2 h-6 w-6" />
              Login to Join
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            By joining, you agree to share your name and email with other group members.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
