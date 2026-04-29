import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ActivityTimeline } from "@/components/groups/activity-timeline";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const logs = await prisma.activityLog.findMany({
    where: {
      group: {
        members: {
          some: { userId: session.user.id }
        }
      }
    },
    include: {
      user: true,
      group: true
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-10">
      <div className="container mx-auto py-8 md:py-12 px-4 space-y-8">
        <div className="flex flex-col gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-orange-500 transition-colors text-sm font-bold">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Activity Feed</h1>
              <p className="text-muted-foreground font-medium">Real-time updates from all your circles.</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-card border border-white/5 shadow-xl">
          <ActivityTimeline logs={logs} />
        </div>
      </div>
    </div>
  );
}
