import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Shield, Bell, QrCode } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background pb-44 md:pb-20">
      <div className="container mx-auto py-8 md:py-12 px-4 space-y-8 max-w-2xl">
        <div className="flex flex-col items-center text-center space-y-4 pt-10">
          <Avatar className="h-32 w-32 border-4 border-orange-500/20 shadow-2xl">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="text-4xl font-bold bg-muted uppercase">{user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground font-medium">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* UPI & Name Settings */}
          <Card className="bento-card glass-card overflow-hidden">
            <CardContent className="p-6">
              <ProfileForm user={user} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bento-card glass-card overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                <Link href="/profile/notifications" className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                      <Bell className="h-5 w-5" />
                    </div>
                    <span className="font-bold">Notifications</span>
                  </div>
                  <span className="text-muted-foreground text-sm font-medium">Enabled</span>
                </Link>
                <Link href="/profile/security" className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span className="font-bold">Privacy & Security</span>
                  </div>
                  <span className="text-muted-foreground text-sm font-medium">Secure</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="pt-4">
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
